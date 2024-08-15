import { OpenAIEmbeddings } from '@langchain/openai'
import { db } from "@/db";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import { userAgent } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'
import { Pinecone } from "@pinecone-database/pinecone";
import pc from "@/lib/pinecone";
import { PineconeStore } from '@langchain/pinecone';

const f = createUploadthing();
 
export const ourFileRouter = {
 
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    
    .middleware(async ({ req }) => {
    
      const {getUser} = getKindeServerSession()
      const user = await getUser()

      if(!user || !user.id) throw new Error('Unauthorized')
      return {userId:user.id};
    }) 
    .onUploadComplete(async ({ metadata, file }) => {
        const createdFile = await db.file.create({
          data:{
            key:file.key,
            name:file.name,
            userId:metadata.userId,
            url:file.url,
            uploadStatus:'PROCESSING', 
          }
        })

        try {
          
          const response = await fetch(file.url)

          const blob = await response.blob()

          const loader = new PDFLoader(blob)

          const pageLevelDocs = await loader.load()

          const pagesAmt = pageLevelDocs.length 


          //vectorization
         
          const pineconeIndex = pc.Index("doc")

          const embeddings = new OpenAIEmbeddings({
            apiKey:process.env.OPEN_AI_KEY!
          })

          await PineconeStore.fromDocuments(pageLevelDocs,embeddings,{
            pineconeIndex,
            namespace:createdFile.id
          })

        
          await db.file.update({
            data:{
              uploadStatus:"SUCCESS"
            },
            where:{
              id:createdFile.id
            }
          })

        } catch (error) {

          await db.file.update({
            data:{
              uploadStatus:"FAILED"
            },
            where:{
              id:createdFile.id
            }
          })
          
        }
      
      return {};
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;