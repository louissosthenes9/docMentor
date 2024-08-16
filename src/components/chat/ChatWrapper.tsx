"use client";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";

interface Props {
  fileId: string;
}
export default function ChatWrapper({ fileId }: Props) {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (data) => {
        if (data?.status === "SUCCESS" || data?.status === "FAILED") {
          return false;
        }
        return 500;
      },
    }
  );



  if (isLoading)
    return (
      <div className="relative min-h-full bg-zinc-50 flex flex-col justify-between gap-2 divide-zinc-200">
        <div className="flex-1 flex justify-center mb-28 items-center flex-col">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue" />
            <h3 className="font-bold text-xl">loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your file
            </p>
          </div>
        </div>
      </div>
    );

  if (data?.status === "PROCESSING")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );
  if (data?.status === "FAILED")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">Too many pages in PDF...</h3>
            <p className="text-zinc-500 text-sm">Your <span className="font-medium">Free</span>supports 5 pages per page</p>
           <Link href={"/dashboard"} className={buttonVariants({
            variant:"secondary",
            className:"mt-4"
           })}><ChevronLeft />Back </Link>
          
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  return (
    <ChatContextProvider fileId={fileId}>
    <div className="relative min-h-full flex-col divide-y bg-zinc-200 ">
      <div className="flex-1 justify-between flex flex-col mb-28">
        <Messages fileId={fileId} />
      </div>

      <ChatInput isDisabled />
    </div>
    </ChatContextProvider>
  );
}
