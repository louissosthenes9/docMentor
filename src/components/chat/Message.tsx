import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import { Icons } from "../Icons";
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import React, { useContext, useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Loader2Icon } from "lucide-react";
import { ChatContext } from "./ChatContext";

interface MessageProps {
    message: ExtendedMessage;
    isNextMessageSamePerson: boolean;
}

type CodeProps = {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
};

export default function Message({ message, isNextMessageSamePerson }: MessageProps) {
    const { loadingMessageId } = useContext(ChatContext);
    const isLoading = message.id === loadingMessageId;
    
    // Handle AI messages that are placeholders (when text is "...")
    const isAIPlaceholder = !message.isUserMessage && message.text === "...";
    
    // Track message content for animations if needed
    const [messageContent, setMessageContent] = useState<string>(message.text as string);
    
    // Update message content when the message changes
    useEffect(() => {
        if (message.text !== messageContent) {
            setMessageContent(message.text as string);
        }
    }, [message.text]);

    const formatMessageTime = (date: Date | string | number) => {
        try {
            const messageDate = new Date(date);
            const absolute = format(messageDate, 'HH:mm');
            const relative = formatDistanceToNow(messageDate, { addSuffix: true });
            return { absolute, relative };
        } catch (error) {
            console.error('Error formatting date:', error);
            return { absolute: '--:--', relative: 'unknown time' };
        }
    };

    const timeDisplay = React.useMemo(() => {
        if (!message.createdAt) return null;
        return formatMessageTime(message.createdAt);
    }, [message.createdAt]);

    const [showRelativeTime, setShowRelativeTime] = React.useState(true);
    
    const toggleTimeFormat = () => {
        setShowRelativeTime(prev => !prev);
    };

    // Determine message display state
    const isMessageDisplayLoading = isLoading || isAIPlaceholder;

    return (
        <div
            className={cn('flex items-end', {
                "justify-end": message.isUserMessage,
                "opacity-70": isLoading
            })}
        >
            <div className={cn("relative flex h-6 w-6 aspect-square items-center justify-center", {
                "order-2 bg-blue-600 rounded-sm": message.isUserMessage,
                "order-1 bg-zinc-800 rounded-sm": !message.isUserMessage,
                "invisible": isNextMessageSamePerson
            })}>
                {message.isUserMessage ? (
                    <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4" />
                ) : (
                    <Icons.logo className="fill-zinc-400 text-zinc-200 h-3/4" />
                )}
            </div>

            <div className={cn("flex flex-col space-y-2 text-base mx-2 max-w-md md:max-w-2xl", {
                "order-1 items-end": message.isUserMessage,
                "order-2 items-start": !message.isUserMessage,
            })}>
                <div className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-blue-600": message.isUserMessage,
                    "bg-gray-200": !message.isUserMessage,
                    "rounded-br-none": !isNextMessageSamePerson && message.isUserMessage,
                    "rounded-bl-none": !isNextMessageSamePerson && !message.isUserMessage
                })}>
                    {isMessageDisplayLoading ? (
                        <div className="flex items-center space-x-2">
                            <span className={cn({
                                "text-zinc-50": message.isUserMessage,
                                "text-zinc-800": !message.isUserMessage
                            })}>
                                {message.isUserMessage ? "Sending" : "Thinking..."}
                            </span>
                            <Loader2Icon className={cn("animate-spin h-4 w-4", {
                                "text-zinc-50": message.isUserMessage,
                                "text-zinc-800": !message.isUserMessage
                            })} />
                        </div>
                    ) : (
                        <ReactMarkdown
                            className={cn("prose prose-sm max-w-none", {
                                'text-zinc-50 prose-headings:text-zinc-50 prose-strong:text-zinc-50 prose-code:text-zinc-50': message.isUserMessage,
                                'text-zinc-800 prose-headings:text-zinc-800 prose-strong:text-zinc-800 prose-code:text-zinc-800': !message.isUserMessage,
                                'prose-p:leading-relaxed prose-pre:p-0': true
                            })}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                code({ inline, className, children, ...props }: CodeProps) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const language = match ? match[1] : '';

                                    if (!inline && language) {
                                        return (
                                            <div className="rounded-md overflow-hidden my-2">
                                                <SyntaxHighlighter
                                                    language={language}
                                                    style={vscDarkPlus}
                                                    PreTag="div"
                                                    customStyle={{
                                                        margin: 0,
                                                        borderRadius: '0.375rem',
                                                    }}
                                                >
                                                    {Array.isArray(children) ? children.join('') : String(children)}
                                                </SyntaxHighlighter>
                                            </div>
                                        );
                                    }

                                    return (
                                        <code
                                            className={cn("rounded px-1 py-0.5", {
                                                "bg-zinc-700 text-zinc-50": message.isUserMessage,
                                                "bg-zinc-200 text-zinc-800": !message.isUserMessage
                                            })}
                                            {...props}
                                        >
                                            {Array.isArray(children) ? children.join('') : children}
                                        </code>
                                    );
                                },
                                p({ children }) {
                                    return <p className="mb-2 last:mb-0">{children}</p>;
                                },
                                ul({ children }) {
                                    return <ul className="list-disc pl-4 mb-2 last:mb-0">{children}</ul>;
                                },
                                ol({ children }) {
                                    return <ol className="list-decimal pl-4 mb-2 last:mb-0">{children}</ol>;
                                },
                                li({ children }) {
                                    return <li className="mb-1 last:mb-0">{children}</li>;
                                },
                                a({ href, children }) {
                                    return (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn("underline", {
                                                "text-zinc-50 hover:text-zinc-200": message.isUserMessage,
                                                "text-blue-600 hover:text-blue-800": !message.isUserMessage
                                            })}
                                        >
                                            {children}
                                        </a>
                                    );
                                }
                            }}
                        >
                            {typeof messageContent === 'string' ? messageContent : String(messageContent)}
                        </ReactMarkdown>
                    )}

                    {timeDisplay && !isMessageDisplayLoading && (
                        <div 
                            className={cn("text-xs select-none mt-2 w-full text-right cursor-pointer", {
                                "text-zinc-500": !message.isUserMessage,
                                "text-blue-300": message.isUserMessage
                            })}
                            onClick={toggleTimeFormat}
                            title="Click to toggle time format"
                        >
                            {showRelativeTime ? timeDisplay.relative : timeDisplay.absolute}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}