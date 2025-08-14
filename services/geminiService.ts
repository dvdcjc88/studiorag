import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Message, Role } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = "You are a helpful and knowledgeable legal assistant specializing in Philippine Laws and Jurisprudence. Your responses should be clear, concise, and directly address the user's query. When providing information, cite the relevant articles or sections of the law if possible. Always ground your answers in the provided search results. Do not hallucinate or provide information not present in the search results.";

interface StreamHandler {
    onChunk: (text: string) => void;
    onComplete: (fullResponse: GenerateContentResponse) => void;
    onError: (error: Error) => void;
}

export const streamChatResponse = async (chatHistory: Message[], newPrompt: string, handler: StreamHandler) => {
    const contents = [
        ...chatHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        })),
        {
            role: 'user' as const,
            parts: [{ text: newPrompt }]
        }
    ];

    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.3,
                tools: [{ googleSearch: {} }],
            },
        });

        let lastChunk: GenerateContentResponse | null = null;
        for await (const chunk of responseStream) {
            handler.onChunk(chunk.text);
            lastChunk = chunk;
        }

        if (lastChunk) {
            // The `.response` property on the stream is deprecated in this SDK version.
            // We use the last chunk from the stream to get metadata like grounding sources.
            // The full text has already been reconstructed by the `onChunk` handler.
            handler.onComplete(lastChunk);
        } else {
            handler.onError(new Error("The response stream was empty."));
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        handler.onError(error instanceof Error ? error : new Error('An unknown error occurred'));
    }
};
