'use client'
import SimpleBar from "simplebar-react"
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Document, Page, pdfjs } from 'react-pdf'
import { useToast } from './ui/use-toast';
import { useResizeDetector } from 'react-resize-detector'
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { z } from 'zod'; 
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger,DropdownMenuContent } from './ui/dropdown-menu';
import PdfFullScreen from "./PdfFullScreen"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
   url: string
}

export default function PdfRenderer({ url }: PdfRendererProps) {
   const { toast } = useToast()
   const [scale, setScale] = useState<number>(1)
   const [numPages, setNumPages] = useState<number | null>(null)
   const [currPage, setCurrPage] = useState<number>(1)
   const { width, ref } = useResizeDetector()
   const [rotation,setRotation]= useState<number>(0)
   const[renderedScale,setRenderedScale]=useState<number | null>(null)
 
   const isLoading = renderedScale !== scale
   
   const handleNextPage = () => {
      setCurrPage(prev => (prev + 1 <= (numPages ?? 1) ? prev + 1 : prev));
   };

   const handlePrevPage = () => {
      setCurrPage(prev => (prev - 1 > 0 ? prev - 1 : prev));
   };

   const CustomPageValidator = z.object({
      page: z.string().refine((num) => Number(num) > 0 && Number(num) <= numPages!)
   })

   type TCustomPageValidator = z.infer<typeof CustomPageValidator>

   const {register, handleSubmit, formState: {errors}, setValue} = useForm<TCustomPageValidator>({
      defaultValues: {
         page: "1",        
      },
      resolver: zodResolver(CustomPageValidator)
   })

   const handlePageSubmit = ({ page }: TCustomPageValidator) => {
      setCurrPage(Number(page))
      setValue("page", String(page))
   }

   return (
      <div className="w-full rounded-md flex flex-col bg-white shadow items-center">
         <div className="h-14 px-2 w-full border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
               <Button
                  disabled={currPage <= 1}
                  onClick={handlePrevPage}
                  variant='ghost'
                  aria-label='previous page'>
                  <ChevronUp className='h-4 w-4 ' />
               </Button>
               <div className="flex items-center gap-1 5">
                  <Input
                     {...register("page")}
                     placeholder={String(currPage)}
                     onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           handleSubmit(handlePageSubmit)()
                        }
                     }}
                     className={cn('w-10 h-8', errors.page && "focus-visible:ring-500")}
                  />
                  <p className="text-zinc-700 text-sm space-x-1">
                     <span>/</span>
                     <span>{numPages ?? "x"}</span>
                  </p>
               </div>
               <Button
                  disabled={currPage >= (numPages ?? 1)}
                  onClick={handleNextPage}
                  variant='ghost'
                  aria-label='next page'>
                  <ChevronDown className='h-4 w-4 ' />
               </Button>
            </div>
            
            <div className="space-x-2">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button aria-label='zoom' className='gap-1.5' variant={'ghost'}>
                        <Search className='h-4 w-4'/>
                        {scale * 100}%
                        <ChevronDown aria-hidden='true' className='h-3 w-3 opacity-50' />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     {[0.5, 0.75, 1, 1.25, 1.5, 2].map((scaleValue) => (
                        <DropdownMenuItem key={scaleValue} onSelect={() => setScale(scaleValue)}>
                           {scaleValue * 100}%
                        </DropdownMenuItem>
                     ))}
                  </DropdownMenuContent>
               </DropdownMenu> 

                <Button
                onClick={()=>setRotation((prev)=>prev + 90)}
                 aria-label= "rotate 90" 
                 variant={'ghost'}>
                  <RotateCw  className="h-4 w-4" />
                </Button>

                <PdfFullScreen fileUrl={url} />
            </div>
         </div>
         <div className="flex-1 w-full max-h-screen">
            <SimpleBar  autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
                  {isLoading && renderedScale ?
                  (<Page 
                  rotate={rotation}
                  pageNumber={currPage} 
                  scale={scale} 
                  key={"@"+renderedScale}
                  width={width ? width : 1} />
                  ):
                    
                  <Page 
                  className={cn(isLoading ? "hidden":"")}
                  rotate={rotation}
                  pageNumber={currPage} 
                  scale={scale} 
                  width={width ? width : 1} 
                  key={"@"+scale}
                  loading={
                     <div className="flex justify-center ">
                         <Loader2 className="my-24 animate-spin h-6 w-6 "/>
                     </div>
                  }
                  onRenderSuccess={()=>{setRenderedScale(scale)}}
                  />
                  }
               </Document>
            </div>
            </SimpleBar>
         </div>
      </div>
   )
}