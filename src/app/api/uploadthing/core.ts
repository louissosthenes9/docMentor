import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Pinecone } from "@pinecone-database/pinecone";
import pc from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import fetch from "node-fetch";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Processing file:", file.name);

      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.url,
          uploadStatus: "PROCESSING",
        },
      });

      if (!createdFile) {
        throw new Error("Failed to create file record in database");
      }

      try {
        // Fetch PDF with timeout
        const response = await fetch(file.url, {
          timeout: 10000,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const blob = new Blob([buffer], { 
          type: response.headers.get("content-type") || "application/pdf" 
        });

        // Load and process PDF
        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();

        if (pageLevelDocs.length === 0) {
          throw new Error("No pages found in PDF");
        }

        console.log(`Processing ${pageLevelDocs.length} pages`);

        // Initialize embeddings with explicit error handling
        const embeddings = new GoogleGenerativeAIEmbeddings({
          apiKey: process.env.GEMINI_API_KEY!,
          modelName: "embedding-001",
        });

        // Verify embeddings work by testing with a sample
        const testEmbed = await embeddings.embedQuery("test");
        if (!testEmbed || testEmbed.length === 0) {
          throw new Error("Embedding generation failed");
        }

        // Initialize Pinecone index
        const pineconeIndex = pc.Index("docmentor");

        // Process documents in smaller batches to avoid timeout
        const batchSize = 20;
        for (let i = 0; i < pageLevelDocs.length; i += batchSize) {
          const batch = pageLevelDocs.slice(i, i + batchSize);
          await PineconeStore.fromDocuments(batch, embeddings, {
            pineconeIndex,
            namespace: createdFile.id,
          });
          console.log(`Processed batch ${i / batchSize + 1}`);
        }

        // Update status to success
        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });

        console.log("Successfully processed file:", file.name);
      } catch (error) {
        console.error("Error processing file:", error);

        // Update status to failed
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });

        throw error;
      }

      return {};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;