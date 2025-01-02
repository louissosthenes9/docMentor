import React, { useContext, useRef } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Loader2, Send } from 'lucide-react'
import { ChatContext } from './ChatContext'

interface Props {
    isDisabled?: boolean
}

const ChatInput = ({ isDisabled = false }: Props) => {
    const { addMessages, handleInputChange, isLoading, message } = useContext(ChatContext)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (!message.trim()) return
        
        await addMessages()
        textareaRef.current?.focus()
    }

    const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        
        if (!message.trim()) return
        
        await addMessages()
        textareaRef.current?.focus()
    }

    return (
        <div className='absolute bottom-0 left-0 w-full'>
            <form 
                className='mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl'
                onSubmit={handleSubmit}
            >
                <div className="relative flex h-full flex-1 items-stretch md:flex-col">
                    <div className="relative flex flex-col w-full flex-grow p-4">
                        <div className="relative">
                            <Textarea
                                rows={1}
                                maxRows={7}
                                ref={textareaRef}
                                value={message}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        if (!message.trim()) return
                                        addMessages()
                                        textareaRef.current?.focus()
                                    }
                                }}
                                disabled={isLoading || isDisabled}
                                autoFocus
                                placeholder='Enter your question...'
                                className='resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 disabled:opacity-50'
                            />

                            <Button
                                disabled={isLoading || isDisabled || !message.trim()}
                                className='absolute bottom-1.5 right-[9px]'
                                aria-label='send message'
                                onClick={handleButtonClick}
                                type='button'
                            >
                                {
                                    isLoading?<Loader2 className='h-4 w-4 animate-spin'/>:<Send className='h-4 w-4' />  
                                 }
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default ChatInput