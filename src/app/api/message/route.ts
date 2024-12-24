import { db } from "@/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pc from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { StreamingTextResponse } from "ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        // Authentication checks...
        const { isAuthenticated, getUser } = getKindeServerSession();
        const isUserAuthenticated = await isAuthenticated();
        
        if (!isUserAuthenticated) {
            return new Response('Unauthorized', { status: 401 });
        }

        const user = await getUser();
        if (!user?.id) {
            return new Response('User not found', { status: 401 });
        }

        const body = await req.json();
        const validatedBody = SendMessageValidator.safeParse(body);
        
        if (!validatedBody.success) {
            return new Response('Invalid request body', { status: 400 });
        }

        const { fileId, message } = validatedBody.data;

        // Database operations...
        const file = await db.file.findFirst({
            where: {
                id: fileId,
                userId: user.id
            }
        });

        if (!file) {
            return new Response('File not found', { status: 404 });
        }

        const userMessage = await db.message.create({
            data: {
                text: message,
                isUserMessage: true,
                userId: user.id,
                fileId
            }
        });

        // Vector search...
        const pineconeIndex = pc.Index("docmentor");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY!,
            modelName: "embedding-001",
        });

        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file.id
        });

        const results = await vectorStore.similaritySearch(message, 4);

        const prevMessages = await db.message.findMany({
            where: { fileId },
            orderBy: { createdAt: "asc" },
            take: 8
        });

        const formattedMessages = prevMessages.map((msg) => ({
            role: msg.isUserMessage ? "user" : "model",
            parts: [{ text: msg.text }]
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({
            history: formattedMessages,
            generationConfig: { temperature: 0 },
        });

        const contextPrompt = `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. 
        If you don't know the answer, just say that you don't know, don't try to make up an answer.

        CONTEXT:
        ${results.map((r) => r.pageContent).join('\n\n')}

        USER INPUT: ${message}`;

        // Key changes in streaming implementation
        const response = await chat.sendMessageStream(contextPrompt);
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullResponse = '';
                
                try {
                    for await (const chunk of response.stream) {
                        const chunkText = chunk.text();
                        fullResponse += chunkText;
                        controller.enqueue(encoder.encode(chunkText));
                    }
                    
                    // Store AI response after stream is complete
                    if (fullResponse.trim()) {
                        await db.message.create({
                            data: {
                                text: fullResponse,
                                isUserMessage: false,
                                fileId,
                                userId: user.id
                            }
                        });
                    }
                    
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error('API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}