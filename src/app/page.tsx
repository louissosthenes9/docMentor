import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="mb-12 text-center mt-28 sm:mt-40 items-center justify-center flex flex-col">
        <div className="mx-auto mb-4 flex max-w-fit justify-center  rounded-full border-gray-200 px-7 py-2  hover:bg-white/50 hover:border-gray-300 shadow-md backdrop-blurr space-x-3 overflow-hidden transition-all ">
          <p className="text-sm font-semibold text-gray-700">
            Doc-mentor is now available
          </p>
        </div>
        <h1 className="lg:text-7xl max-w-4xl text-5xl font-bold md:text-6xl">
          <div>
            Chat with your <span className="text-blue-600">documents</span> in
            seconds
          </div>
        </h1>
        <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
          Doc is your readily available mentor for any of your pdf documents.
          Simply upload your file and tell us what you wanna know about
        </p>
        <Link
          className={buttonVariants({
            size: "lg",
            className: "mt-5",
          })}
          href="/dashboard"
          target="_blank"
        >
          Get started <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </MaxWidthWrapper>

      {/*** value proposition */}
      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu  overflow-hidden blur-3xl sm:top-80 "
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%- 11rem)] -translate-x-1/2 rotate-[30deg] aspect-[1155/670] w-[36.125rem] bg-gradient-to-tr from-[#ff00b5] to-[#9089fc]  opacity-30 sm:left-calc(50%-30rem) sm:w-[72.1875rem]"
            />
          </div>
          <div>
            {/* Hero section and pitch */}
            <div className="mx-auto px-6 max-w-6xl lg:px-8">
              <div className="mt-16 flow-root sm:mt-24 ">
                <div className="-m-2 rounded-xl bg-gray-900/5 lg:rounded-2xl ring-gray-900/10  lg:p-4 lg:-m-4 p-2 ring-1 ring-inset">
                  <Image
                    src="/dashboard-preview.jpg"
                    alt="preview image"
                    height={866}
                    width={1364}
                    quality={100}
                    className="shadow-2xl ring-1 ring-gray-900/10 rounded-md bg-white p-2 sm:p-8 md:p-20"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu  overflow-hidden blur-3xl sm:top-80 "
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%- 13rem)] -translate-x-1/2 rotate-[30deg] aspect-[1155/670] w-[36.125rem] bg-gradient-to-tr from-[#ff00b5] to-[#9089fc]  opacity-30 sm:left-calc(50%-36rem) sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </div>
      {/** Features sections**/}
      <div className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 font-bold text-4xl text-gray-500 sm:text-5xl">
              Start chatting in minutes
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Let doc-mentor enlighten your documents
            </p>
          </div>
        </div>
        {/***steps */}
        <ol className="my-8 space-y-4 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 pl-4 md:pl-0 md:border-t-2 md:pb-0 py-2 border-zinc-300 ">
              <span className="text-sm font-medium text-blue-600 ">Step 1</span>
              <span className="text-xl font-semibold">
                Sign up for an account
              </span>
              <span className="mt-2 text-zinc-700">
                Try out the our free plan or choose our {"  "}
                <Link
                  className="underline text-blue-700 underline-offset-2"
                  href={"/pricing"}
                >
                  pro plan.
                </Link>
              </span>
            </div>
          </li>

          {/* step 2  */}
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 pl-4 md:pl-0 md:border-t-2 md:pb-0 py-2 border-zinc-300 ">
              <span className="text-sm font-medium text-blue-600 ">Step 2</span>
              <span className="text-xl font-semibold">
                Upload your PDF file
              </span>
              <span className="mt-2 text-zinc-700">
                We&apos;ll process your file and get ready to elloborate it
                according to your needs
              </span>
            </div>
          </li>

          {/* step 3 */}
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 pl-4 md:pl-0 md:border-t-2 md:pb-0 py-2 border-zinc-300 ">
              <span className="text-sm font-medium text-blue-600 ">Step 3</span>
              <span className="text-xl font-semibold">
                Then start to ask questions
              </span>
              <span className="mt-2 text-zinc-700">
                It&apos;s Simple. try it now
              </span>
            </div>
          </li>
        </ol>

        <div className="mx-auto px-6 max-w-6xl lg:px-8">
              <div className="mt-16 flow-root sm:mt-24 ">
                <div className="-m-2 rounded-xl bg-gray-900/5 lg:rounded-2xl ring-gray-900/10  lg:p-4 lg:-m-4 p-2 ring-1 ring-inset">
                  <Image
                    src="/file-upload-preview.jpg"
                    alt="uploading previw image"
                    height={732}
                    width={1410}
                    quality={100}
                    className="shadow-2xl ring-1 ring-gray-900/10 rounded-md bg-white p-2 sm:p-8 md:p-20"
                  />
                </div>
              </div>
            </div>
      </div>
    </>
  );
}
