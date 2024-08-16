import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import React from 'react'

type MessagesProps ={
  fileId:string
}
const Messages = ({fileId}:MessagesProps) => {
  const {} = trpc.getFileMessages.useInfiniteQuery({
    fileId,
    limit:INFINITE_QUERY_LIMIT
  },{
    getNextPageParam:(lastPage)=>lastPage?.nextCursor,
    keepPreviousData:true
  })
  return (
    <div>Message</div>
  )
}

export default Messages