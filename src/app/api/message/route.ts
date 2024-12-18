import { db } from "@/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pc from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { StreamingTextResponse } from "ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const POST = async (req: NextRequest) => {
    const body = await req.json();

    const { isAuthenticated, getUser } = getKindeServerSession();

    const isUserAuthenticated = await isAuthenticated();
    if (!isUserAuthenticated) {
        return new Response('unauthorized', { status: 401 });
    }

    const user = await getUser();
    //@ts-ignore
    const userId = user.id;

    const { fileId, message } = SendMessageValidator.parse(body);

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId
        }
    });

    if (!file) return new Response('Not Found', { status: 404 });

    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId,
            fileId
        }
    });

    // Vectorization of the message
    const pineconeIndex = pc.Index("docmentor");

    const embeddings = new GoogleGenerativeAIEmbeddings({
              apiKey: process.env.GEMINI_API_KEY!, // Use Gemini API key
              modelName: "embedding-001", // Gemini embedding model
            });

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file.id
    });

    const results = await vectorStore.similaritySearch(message, 4);

    const prevMessages = await db.message.findMany({
        where: {
            fileId
        },
        orderBy: {
            createdAt: "asc"
        },
        take: 8
    });

    const formattedMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? "user" : "model",
        parts: [{ text: msg.text }]
    }));

    // Initialize Gemini chat
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
        history: formattedMessages,
        generationConfig: {
            temperature: 0,
        },
    });

    const systemPrompt = 'Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.';

    const contextPrompt = `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. 
    If you don't know the answer, just say that you don't know, don't try to make up an answer.

    CONTEXT:
    ${results.map((r) => r.pageContent).join('\n\n')}

    USER INPUT: ${message}`;

    // Create a TransformStream for handling the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    try {
        const response = await chat.sendMessageStream(contextPrompt);
        
        for await (const chunk of response.stream) {
            const chunkText = chunk.text();
            await writer.write(new TextEncoder().encode(chunkText));
        }

        // Save the complete response to the database
        const completeResponse = await (await response.response).text();
        await db.message.create({
            data: {
                text: completeResponse,
                isUserMessage: false,
                fileId,
                userId
            }
        });

        writer.close();
    } catch (error) {
        console.error('Error in stream:', error);
        writer.close();
    }

    return new StreamingTextResponse(stream.readable);
};