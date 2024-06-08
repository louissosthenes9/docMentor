
import { trpc } from "@/app/_trpc/client";
import { notFound, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/db";
import PdfRenderer from "@/components/PdfRenderer";
import ChatWrapper from "@/components/ChatWrapper";
interface PageProps{
    params : {        fileid:string
    }
}
export default async function page({params}:PageProps) {
   //retrieve the file id
   // const router = useRouter()
    const {fileid} = params

    
    //make the database call

    // const [user, setUser] = useState(null);

    // useEffect(() => {
    //   // Fetch the user data from the API
    //   fetch('/api/KindeUser')
    //     .then(response => response.json())
    //     .then(data => setUser(data));
    //   }, []);
  
      //if(!user) redirect(`/auth-callback?origin=dashboard/${fileid}`);
     
      //db call 
      const file = await db.file.findFirst({
        where:{
            id:fileid,
            //userId:user.id
        }
      })


      if(!file) notFound
     
    

    
    

  return (
   <div className="h-[cacl(100vh-3.5rem)] flex-1 jusstify-between flex flex-col">
     <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-3">
        {/* left side */}

        <div className="flex-1 xl:flex">
            <div className="px-4 sm-px-6 lg:pl-8 xl:flex-1 py-6 xl:pl-6">
                <PdfRenderer />
            </div>
        </div>
       
       {/* right handside */}
        
        <div className="lg:border-l lg:border-t-0 shrink-0 border-t flex-[0.75] border-gray-200 lg:w-96">
               <ChatWrapper />
        </div>
    </div> 
   </div>
  )

  }
