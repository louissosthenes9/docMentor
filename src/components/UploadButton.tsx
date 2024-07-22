"use client"
import { Dialog,DialogContent, DialogTrigger } from "./ui/dialog"
import { useState } from "react"
import { Button } from "./ui/button"

export default function UploadButton() {
   const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open = {isOpen} onOpenChange={(v)=>{
      if(!v){
        setIsOpen(v)
      }
    }}>
  <DialogTrigger asChild  onClick={()=>{setIsOpen(true)}}> 
    <Button>Upload pdf</Button>
   </DialogTrigger>


   <DialogContent>
         example content
   </DialogContent>
  </Dialog>
  )
}
