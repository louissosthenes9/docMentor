
import { db } from "@/db";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { userAgent } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();
 
export const ourFileRouter = {
 
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    
    .middleware(async ({ req }) => {
    
      const {user} = useKindeBrowserClient()

      if(!user || user.id) throw new Error('Unauthorized')
      return {userId:user.id};
    }) 
    .onUploadComplete(async ({ metadata, file }) => {
        const createdFile = await db.file.create({
          data:{
            key:file.key,
            name:file.name,
            userId:metadata.userId,
            url:`https://uploadthing-prod.s3.us-west.amazonaws.com/${file.key}`,
            uploadStatus:'PROCESSING', 
          }
        })
      
      return {};
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;