import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const POST = async (req : NextRequest)=>{
   
    const body = await req.json()

    const {isAuthenticated,getUser} = getKindeServerSession()

    const isUserAuthenticated = await isAuthenticated();
    if(isUserAuthenticated === false)
        return new Response('unauthorized',{status:401})

    
    const user =  await getUser();

    
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
            isUserAuthenticated:true,
            userId,
            fileId
        }
    })
}