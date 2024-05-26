import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'

export default function page() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    const {data, isLoading}= trpc.authCallback.useQuery(undefined,{
      onSuccess:({success})=>{
        router.push(origin?`${origin}`:'/dashboard')
      },
      onError:(error)=>{
        if(error.data?.code==="UNAUTHORIZED"){
          router.push("/sign-in")
        }
      },
      retry:true,
      retryDelay:500
    })
  return (
     <div className="w-full flex justify-center  mt-24">
       <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
          <h3 className='font-semibold text-xl'>setting up your account...</h3>
          <p>You will be directed automatically</p>
        
       </div>

     </div>
  )
}
