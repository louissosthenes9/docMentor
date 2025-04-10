import { db } from "@/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pc from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { StreamingTextResponse } from "ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Define the Message type interface
interface Message {
    id: string;
    text: string;
    isUserMessage: boolean;
    userId: string;
    fileId: string;
    createdAt: Date;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        // Authentication checks
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

        // Database operations
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

        // Vector search with increased number of results for better context
        const pineconeIndex = pc.Index("docmentor");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY!,
            modelName: "embedding-001",
        });

        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file.id
        });

        // Increased to 6 results for better context coverage
        const results = await vectorStore.similaritySearch(message, 6);

        const prevMessages = await db.message.findMany({
            where: { fileId },
            orderBy: { createdAt: "asc" },
            take: 8
        }) as Message[];

        const formattedMessages = prevMessages.map((msg: Message) => ({
            role: msg.isUserMessage ? "user" : "model",
            parts: [{ text: msg.text }]
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const chat = model.startChat({
            history: formattedMessages,
            generationConfig: { temperature: 0.3 }, // Slightly increased for more natural responses
        });

        const contextPrompt = `You are an AI assistant specifically trained to answer questions about the uploaded document. Follow these rules strictly:

1. PRIMARY SOURCE: Always prioritize information from the uploaded document first. The relevant excerpts from the document are provided below as your primary context.

2. CONTEXT USAGE:
   - If the document context fully answers the question: Use ONLY the document information
   - If the document context partially answers the question: Start with document information, then supplement with additional knowledge
   - If the document context is irrelevant or insufficient: Only then rely on your general knowledge

3. RESPONSE STRUCTURE:
   - Begin responses with information found in the document when available
   - Clearly indicate when you're supplementing with information from outside the document
   - Use markdown formatting for better readability

DOCUMENT CONTEXT:
${results.map((r) => r.pageContent).join('\n\n')}

PREVIOUS CONVERSATION:
${formattedMessages.map(m => `${m.role.toUpperCase()}: ${m.parts[0].text}`).join('\n')}

QUESTION: ${message}

Remember: You must prioritize the document context in your response. Only use additional knowledge when necessary to provide a complete and accurate answer.`;

        // Improved streaming implementation with better error handling
        try {
            // First attempt a non-streaming call to verify API is working correctly
            const responseCheck = await chat.sendMessage(contextPrompt);
            const fullResponseText = responseCheck.response.text();
            
            // Now proceed with streaming for the actual user response
            const response = await chat.sendMessageStream(contextPrompt);
            
            // Create a variable to collect the full response
            let collectedResponse = '';
            
            const stream = new ReadableStream({
                async start(controller) {
                    const encoder = new TextEncoder();
                    
                    try {
                        for await (const chunk of response.stream) {
                            const chunkText = chunk.text();
                            collectedResponse += chunkText;
                            controller.enqueue(encoder.encode(chunkText));
                        }
                        
                        controller.close();
                    } catch (error) {
                        console.error('Streaming error:', error);
                        controller.error(error);
                    }
                }
            });
            
            // Save the AI response to the database separately from the stream
            // This ensures we don't miss saving due to stream errors
            if (fullResponseText) {
                await db.message.create({
                    data: {
                        text: fullResponseText,
                        isUserMessage: false,
                        fileId,
                        userId: user.id
                    }
                });
            }
            
            return new StreamingTextResponse(stream);
        } catch (error) {
            console.error('Gemini API Error:', error);
            
            // Fallback to non-streaming response if streaming fails
            try {
                const fallbackResponse = await chat.sendMessage(contextPrompt);
                const fallbackText = fallbackResponse.response.text();
                
                // Save to database
                await db.message.create({
                    data: {
                        text: fallbackText,
                        isUserMessage: false,
                        fileId,
                        userId: user.id
                    }
                });
                
                // Return as normal response
                return new Response(fallbackText);
            } catch (secondError) {
                console.error('Fallback error:', secondError);
                return new Response('Failed to generate response. Please try again.', { status: 500 });
            }
        }
    } catch (error) {
        console.error('API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 