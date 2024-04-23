import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Image from 'next/image'

export default function Home() {
  return (
    <MaxWidthWrapper className='mb-12 text-center mt-28 sm:mt-40 items-center justify-center flex flex-col'>
       <div className='mx-auto mb-4 flex max-w-fit justify-center  rounded-full border-gray-200 px-7 py-2  hover:bg-white/50 hover:border-gray-300 shadow-md backdrop-blurr space-x-3 overflow-hidden transition-all '>
          <p className='text-sm font-semibold text-gray-700'>
             Doc-mentor is now available
          </p>
       </div>
       <h1 className="lg:text-7xl max-w-4xl text-5xl font-bold md:text-6xl">
         <div>Chat with your <span className='text-blue-600'>documents</span> in seconds</div>
       </h1>
    </MaxWidthWrapper>
  )
}
