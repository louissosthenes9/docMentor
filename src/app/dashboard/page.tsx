"use client"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { redirect} from 'next/navigation'
import { trpc } from '@/app/_trpc/client';
import Dashboard from '@/components/Dashboard';
import { db } from "@/db";
const page = async () => {
   const {user} =useKindeBrowserClient();
   
   //check if the user is authenticated
  if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

  //sync to the db
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  })

  //if not in db then redirect
  if(!dbUser) redirect('/auth-callback?origin=dashboard')
  
  return (
      <Dashboard />
   )
}

export default page;
