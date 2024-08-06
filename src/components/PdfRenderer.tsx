'use client'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Document, Page, pdfjs } from 'react-pdf'


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRendererProps{
   url:string
}


export default function PdfRenderer({url}:PdfRendererProps) {
  return (
     <div className="w-full rounded-md flex flex-col bg-white shadow items-center">
         <div className="h-14 px-2 w-full border-b border-zinc-200 flex items-center justify-between">

                <div className="flex items-center gap-1.5">
                    top bar
                </div>

         </div>
           <div className="flex-1 w-full max-h-screen">
                  <div>
                        <Document file={url} className='max-h-full'>
                            <Page pageNumber={1} />
                        </Document>
                  </div>
           </div>
     </div>
  )
}
