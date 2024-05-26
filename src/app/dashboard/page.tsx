
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect,useRouter } from 'next/navigation'
import React from 'react'
import { trpc } from '@/app/_trpc/client';
import Dashboard from '@/components/Dashboard';
const page = async () => {

  const router = useRouter()
  const {getUser} = getKindeServerSession()
  const user = getUser()
  if(!user) redirect('/auth-callback?origin=dashboard');
  
  const {data, isLoading} = trpc.authCallback.useQuery(undefined,{
    // succes represents data from the database
    
    onSuccess:({success})=>{
      if(success){
        //sync to the database

        router.push(origin?`/${origin}`:'/dashboard')
      
      
      
      }
    }
  })
  
  return (
     <Dashboard />
  )
}

export default page;