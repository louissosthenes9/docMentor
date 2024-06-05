"use client"
import { redirect, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { trpc } from '@/app/_trpc/client';
import Dashboard from '@/components/Dashboard';

const page = async () => {
   const router = useRouter()
   const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch the user data from the API
    fetch('/api/KindeUser')
      .then(response => response.json())
      .then(data => setUser(data));
    }, []);

  //   if(!user) redirect('/auth-callback?origin=dashboard');
  //  const {data, isLoading} = trpc.authCallback.useQuery(undefined,{
  //     // success represents data from the database
  //     onSuccess:({success})=>{
  //       if(success){
  //         //sync to the database
  //         router.push(origin?`/${origin}`:'/dashboard')
  //       }
  //    }
  //   })
  
   return (
      <Dashboard />
   )
}

export default page;
