import { trpc } from "@/app/_trpc/client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/db";
interface PageProps{
    params : {
        fileid:string
    }
}
export default async function page({params}:PageProps) {
   //retrieve the file id
    const router = useRouter()
    const {fileid} = params


    //make the database call

    const [user, setUser] = useState(null);

    useEffect(() => {
      // Fetch the user data from the API
      fetch('/api/KindeUser')
        .then(response => response.json())
        .then(data => setUser(data));
      }, []);
  
      if(!user) redirect(`/auth-callback?origin=dashboard/${fileid}`);
     
      //db call 
      const file = await db.file.findFirst({
        where:{
            id:fileid,
            userId:user.id
        }
      })
     
    

    
    

  return (
    <div>page</div>
  )

  }
