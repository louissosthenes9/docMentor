import React from 'react'
import UploadButton from './UploadButton'
export default function Dashboard() {
  return (
     <main className="mx-auto ma-w-7xl md:p-10">
         <div className="mt-8 flex flex-col items-start sm:gap-0 sm:flex-row sm:items-center justify-between border-gray-200 pb-5 gap-4">
          <h1 className="mb-3 font-bold text-5xl text-gray-900">
            My Files
          </h1>

            <UploadButton />
         </div>
     </main>
  )
}

