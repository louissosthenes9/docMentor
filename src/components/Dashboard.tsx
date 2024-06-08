"use client"
import UploadButton from './UploadButton'
import {trpc} from "@/app/_trpc/client";
import {Ghost, Link2, Loader2Icon, MessageSquare, Plus, Trash} from "lucide-react";
import Link from 'next/link';
import {format} from "date-fns"
import { Button } from './ui/button';
import { useState } from 'react';
export default function Dashboard() {
   const [currentlyDeletingFile,setCurrentlyDeletingFile]= useState<string | null>(null);
   const utils = trpc.useContext()
   const {data: files,isLoading} = trpc.getUserFiles.useQuery();

  const {mutate :deleteFile}= trpc.deleteFile.useMutation({
    onSuccess:()=>{
     utils.getUserFiles.invalidate()
    },

    onMutate({id}) {
      setCurrentlyDeletingFile(id)
    },

    onSettled(){
      setCurrentlyDeletingFile(null)
    }
  })

  return (
     <main className="mx-auto ma-w-7xl md:p-10">
         <div className="mt-8 flex flex-col items-start sm:gap-0 sm:flex-row sm:items-center justify-between border-gray-200 pb-5 gap-4">
          <h1 className="mb-3 font-bold text-5xl text-gray-900">
            My Files
          </h1>

            <UploadButton />
         </div>
           {/* display all the user files */}

         {files && files?.length !==0 ?(
            <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 lag:grid-cols-2 gap-6 divide-y divide-zinc-300">
                {files.sort((a:any,b:any)=>
                new Date(b.createdAt).getTime()- 
                new Date(a.createdAt).getTime()).map((file)=>(
                  <li key={file.id}
                  className='col-span-1 divide-y divide-gray-zinc-200 bg-white rounded-lg shadow transition hover:shadow-lg'>
                    <Link href={`/dashboard/${file.id}`} className='flex flex-col gap-2'>
                      <div className="pt-6 flex w-full items-center justify-between space-x-6 px 6">
                          <div aria-hidden="true" className='h-1- w-10 flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-500'/>
                     
                          <div className='flex-1 truncate'>
                               <div className="flex items-center space-x-3">
                                   <h3 className='truncate text-lg font-medium text-zinc-900'>
                                        {file.name}
                                   </h3>
                               </div>
                          </div>
                      </div>
                    </Link>
                    <div className="px-6 place-items-center grid grid-cols-3 py-2 gap-6 text-sm mt-4 text-zinc-500">
                       <div className="flex items-center gap-2">
                          <Plus className='w-4 h-4 '/>
                          {format(new Date(file.createdAt),"MMM yyy")}
                         
                       </div>

                       <div className='flex items-center gap-2'>
                        <MessageSquare className='h-4 -4 '/>
                        {/* 
                        

                         To display messages that the user has chatted with the api
                        
                        
                        */}
                    </div>

                      <Button 
                      onClick={()=>deleteFile({id:file.id})}
                      size={'sm'} className='w-full' variant={'destructive'}
                      >
                        { currentlyDeletingFile===file.id?(
                          <Loader2Icon  className='w-4 h-4 animate-spin'/>
                        ): <Trash className='h-4 w-4'/>}
                      </Button>
                    </div> 

                   
                  </li>
                ))
                
                }
            </ul>
         ):isLoading ?(
            <div className="text-center">
                  <p>loading....</p>
            </div>
         ):(
             <div className='mt-16 flex flex-col items-center gap-2'>
                 <Ghost  className='h-8 w-8 text-zinc-800' />
                 <h3 className='font-semibold text-xl'>Pretty empty around here</h3>
                   <p>Let&apos;s upload your first pdf</p> 
             </div>
         )}
     </main>
  )
}

