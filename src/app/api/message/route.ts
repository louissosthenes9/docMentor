import { db } from "@/db";
import pc from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const POST = async (req : NextRequest)=>{
   
    const body = await req.json()

    const {isAuthenticated,getUser} = getKindeServerSession()

    const isUserAuthenticated = await isAuthenticated();
    if(isUserAuthenticated === false){
        return new Response('unauthorized',{status:401})
    }
    
    const user =  await getUser();

   //@ts-ignore
   const  userId= user.id
    

    const {fileId,message} = SendMessageValidator.parse(body)

    const file = await db.file.findFirst({
        where:{
            id:fileId,
            userId
        }
    })


    if(!file) return new Response('Not Found',{status:404})

    await db.message.create({
        data:{
            text:message,
            isUserMessage:true,
            userId,
            fileId
        }
    })

    //vectorization of the message
    const pineconeIndex = pc.Index("doc")

    const embeddings = new OpenAIEmbeddings({
        apiKey:process.env.OPENAI_API_KEY,
    })

    const vectorStore = await  PineconeStore.fromExistingIndex(  embeddings,{
      pineconeIndex,
      namespace:file.id
    })

    const results = await vectorStore.similaritySearch(message,4)

    const prevMessages = await db.message.findMany({
        where:{
            fileId
        },
        orderBy:{
            createdAt:"asc"
        },
        take:8
    })

    const formattedMessages = prevMessages.map((msg)=>(
        {
            role:msg.isUserMessage ? "user" as const :"assistant" as const,
            content:msg.text
        }
    ))


}