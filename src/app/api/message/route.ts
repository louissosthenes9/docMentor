import { db } from "@/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pc from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { StreamingTextResponse } from "ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Helper function for better logging
const prettyLog = (label: string, data: any) => {
    console.log('\n-------------------');
    console.log(`${label}:`);
    try {
        if (typeof data === 'object' && data !== null) {
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(data);
        }
    } catch (error) {
        console.log('Unable to stringify:', data);
    }
    console.log('-------------------\n');
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
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
        prettyLog('Request Body', body);
        
        const validatedBody = SendMessageValidator.safeParse(body);
        
        if (!validatedBody.success) {
            prettyLog('Validation Error', validatedBody.error);
            return new Response('Invalid request body', { status: 400 });
        }

        const { fileId, message } = validatedBody.data;

        const file = await db.file.findFirst({
            where: {
                id: fileId,
                userId: user.id
            }
        });

        if (!file) {
            return new Response('File not found', { status: 404 });
        }

        prettyLog('File Found', file);

        const userMessage = await db.message.create({
            data: {
                text: message,
                isUserMessage: true,
                userId: user.id,
                fileId
            }
        });

        prettyLog('User Message Created', userMessage);

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
        prettyLog('Similarity Search Results', results.map(r => ({
            pageContent: r.pageContent,
            metadata: r.metadata
        })));

        const prevMessages = await db.message.findMany({
            where: { fileId },
            orderBy: { createdAt: "asc" },
            take: 8
        });

        prettyLog('Previous Messages', prevMessages);

        const formattedMessages = prevMessages.map((msg) => ({
            role: msg.isUserMessage ? "user" : "model",
            parts: [{ text: msg.text }]
        }));

        prettyLog('Formatted Messages', formattedMessages);

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

        prettyLog('Context Prompt', contextPrompt);

        const stream = new TransformStream();
        const writer = stream.writable.getWriter();

        try {
            const response = await chat.sendMessageStream(contextPrompt);
            let fullResponse = '';

            for await (const chunk of response.stream) {
                const chunkText = chunk.text();
                fullResponse += chunkText;
                prettyLog('Stream Chunk', chunkText);
                await writer.write(new TextEncoder().encode(chunkText));
            }

        

          try {
            await db.message.create({
                data: {
                    text: fullResponse,
                    isUserMessage: false,
                    fileId,
                    userId: user.id
                }
            });
            
          } catch (error) {
            prettyLog('error in stroring message',error)
          }

            writer.close();



            prettyLog('Full Response', fullResponse);
        } catch (error) {
            prettyLog('Stream Error', {
                //@ts-ignore
                message: error.message,
                //@ts-ignore
                stack: error.stack,
                //@ts-ignore
                name: error.name
            });
            await writer.write(new TextEncoder().encode('An error occurred while processing your request.'));
            writer.close();
            return new Response('Error processing stream', { status: 500 });
        }

        return new StreamingTextResponse(stream.readable);
    } catch (error) {
        prettyLog('API Error', {
            //@ts-ignore
            message: error.message,
            //@ts-ignore
            stack: error.stack,
            //@ts-ignore
            name: error.name
        });
        return new Response('Internal Server Error', { status: 500 });
    }
}