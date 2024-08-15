"use client";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

const UploadDropzone = () => { 

  const router = useRouter()
  
  const [uploadProgress,setUploadProgress]= useState<number>(0)
   
  
  const [isUploading,setIsUploading] = useState<boolean>(true)
  
  const {startUpload} = useUploadThing("pdfUploader")
  
   //simulate upload progress
  const startSimulateProgress = ()=>{
    setUploadProgress(0)

    const interval = setInterval(()=>{
       setUploadProgress((prevProgress)=>{
          if(prevProgress >= 95){
            clearInterval(interval)

            return prevProgress
          }

          return prevProgress + 5
    })
    },500)

    return interval
  }

  const {mutate:startPolling} = trpc.getFile.useMutation({
    onSuccess:(file)=>{
      router.push(`/dashboard/${file.id}`)
    },
    retry:true,
    retryDelay:500
  })

  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {
        setIsUploading(true)     
        const progressInterval = startSimulateProgress()
      
        // handle file upload
         const res = await startUpload(acceptedFile)
       
         //throw an error if something went wrong
         if(!res){
          return toast({
            title:"something went wrong",
            description:'Please try again',
            variant:'destructive',}
          )
           
        }

        const [fileResponse] = res

        const key = fileResponse?.key

        if(!key){
          return toast({
            title:"something went wrong",
            description:'Please try again',
            variant:'destructive',}
          )    

        }


        clearInterval(progressInterval)
        setUploadProgress(100)

        startPolling({key})
      
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed rounded-lg border-gray-300"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center w-full h-full rounded-lg justify-center cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-blue-500 mb-2 " />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">click to upload</span> or drag
                  and drop
                </p>
                <p className="text-sm text-zinc-500">PDF (upto 4MB )</p>
              </div>

              {/* user feedback */}

              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null} 


              {/* loading states */}

              {
                isUploading ? (
                  <div className="w-full mt-4 max-w-xs mx-auto">
                         <Progress   
                         value={uploadProgress} 
                         className={`${uploadProgress===100 ? 'bg-blue-500':'bg-zinc-200' } h-1 w-full`}/>
                         {
                          uploadProgress==100?(
                            <div className="flex gap-1 items-center justify-center text-zinc-700 pt-2 ">
                                     <Loader2 className="animate-spin h-3 w-3" />
                                     Redirecting...
                            </div>
                          ):null
                         }
                  </div>
                ):null
              }
              <input {...getInputProps()} type="file" id="dropzone-file" className="hidden" /> 
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

export default function UploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger
        asChild
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Button>Upload pdf</Button>
      </DialogTrigger>

      <DialogContent>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
}
