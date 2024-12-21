import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import { Icons } from "../Icons";
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ComponentProps } from "react";
import { text } from "stream/consumers";
import React from "react";

interface MessageProps {
    message: ExtendedMessage;
    isNextMessageSamePerson: boolean;
}

// Define proper types for the code component props
type CodeProps = {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
};

export default function Message({ message, isNextMessageSamePerson }: MessageProps) {
    return (
        <div
            className={cn('flex items-end', {
                "justify-end": message.isUserMessage,
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
                                                // Fix for the customStyle type error
                                                customStyle={{
                                                    margin: 0,
                                                    borderRadius: '0.375rem',
                                                } as any}
                                            >
                                                {String(children).replace(/\n$/, '')}
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
                                        {children}
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
                       
                        {message.text}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    )
}