'use client'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Document, Page, pdfjs } from 'react-pdf'
import { useToast } from './ui/use-toast';
import { useResizeDetector } from 'react-resize-detector'
import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { z } from 'zod'; 
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger,DropdownMenuContent } from './ui/dropdown-menu';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
   url: string
}

export default function PdfRenderer({ url }: PdfRendererProps) {
   const { toast } = useToast()
   const [scale,setScale] = useState<Number>(1)
   
   
   const [numPages, setNumPages] = useState<number | null>(null)
   const [currPage, setCurrPage] = useState<number>(1)
   const { width, ref } = useResizeDetector()

   const handleNextPage = () => {
      setCurrPage(prev => (prev + 1 <= (numPages ?? 1) ? prev + 1 : prev));
   };

   const handlePrevPage = () => {
      setCurrPage(prev => (prev - 1 > 0 ? prev - 1 : prev));
   };

   const handlePageSubmit= ({page}:TCustomPageValidator) => {
                      setCurrPage(Number(page))
                          setValue("page",String("page"))
                    }


   const CustomPageValidator = z.object({
      page:z.string().refine((num)=>Number(num)>0 && Number(num)<=numPages!)
   })

   type TCustomPageValidator = z.infer<typeof CustomPageValidator>

   const {register,handleSubmit,formState:{errors}, setValue} = useForm<TCustomPageValidator>({
          defaultValues:{
            page:"1",        
          },
          resolver:zodResolver(CustomPageValidator)
   })
   return (
      <div className="w-full rounded-md flex flex-col bg-white shadow items-center">
         <div className="h-14 px-2 w-full border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
               <Button
                  disabled={currPage >= (numPages ?? 1)}
                  onClick={handleNextPage}
                  variant='ghost'
                  aria-label='next page'>
                  <ChevronDown className='h-4 w-4 ' />
               </Button>
               <div className="flex items-center gap-1 5">
                  <Input
                  {...register("page")}

                  onKeyDown={(e)=>{
                    if(e.key ==="Enter"){
                      handleSubmit(handlePageSubmit)()
                    }
                  }}
                    
                     className={cn('w-10 h-8',errors.page && "focus-visible:ring-500")}
                  />
                  <p className="text-zinc-700 text-sm space-x-1">
                     <span>/</span>
                     <span>{numPages ?? "x"}</span>
                  </p>
               </div>
               <Button
                  disabled={currPage <= 1}
                  onClick={handlePrevPage}
                  variant='ghost'
                  aria-label='previous page'>
                  <ChevronUp className='h-4 w-4 ' />
               </Button>
            </div>
            
            <div className="space-x-2">
                 <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                             <Button aria-label='zoom' className='gap-1.5' variant={'ghost'}>
                                <Search className='h-4 w-4'/>
                                 {Number(scale) * 100}%
                                 <ChevronDown aria-hidden='true' className='h-3 w-3 opacity-50' />
                                  
                             </Button>
                     </DropdownMenuTrigger>
                          
                     <DropdownMenuContent>
                          <DropdownMenuItem> 
                                  100%
                          </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu> 
            </div>

         </div>
         <div className="flex-1 w-full max-h-screen">
            <div ref={ref}>
               <Document
                  loading={
                     <div className='flex justify-center'>
                        <Loader2 className="my-24 h-6 w-6 animate-spin" />
                        <div className='text-sm text-center'>Please wait while we prepare the document</div>
                     </div>
                  }
                  onLoadSuccess={({ numPages }) => {
                     setNumPages(numPages)
                  }}
                  onLoadError={() => {
                     toast({
                        title: 'Error loading PDF',
                        description: 'Please try again',
                        variant: 'destructive'
                     })
                  }}
                  file={url} className='max-h-full'>
                  <Page pageNumber={currPage} />
               </Document>
            </div>
         </div>
      </div>
   )
}
