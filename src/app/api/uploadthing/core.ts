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
      console.log("this is the incoming file object", file);

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
        console.log("error in creating an object in the database in core.tsc");
      }

      try {
        const response = await fetch(file.url,{timeout:10000});

        const buffer = await response.arrayBuffer();

        const contentType = response.headers.get("content-type") || "application/octet-stream";

        const blob = new Blob([buffer], { type: contentType });

        const loader = new PDFLoader(blob);

        const pageLevelDocs = await loader.load();

        const pagesAmt = pageLevelDocs.length;

        //vectorization

        const pineconeIndex = pc.Index("docmentor");

        const embeddings = new GoogleGenerativeAIEmbeddings({
          apiKey: process.env.GEMINI_API_KEY!, // Use Gemini API key
          modelName: "embedding-001", // Gemini embedding model
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        });

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
      } catch (error) {
        console.log(
          "error in updating status to successfull in core.ts:",
          error
        );

        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });
      }

      return {};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
