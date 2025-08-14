import React, { useState, useRef, useEffect } from 'react';
import type { GenerateContentResponse } from '@google/genai';
import { streamChatResponse } from '../services/geminiService';
import type { Message, Source } from '../types';
import { Role } from '../types';
import { ChatMessage } from './ChatMessage';
import { SendIcon } from './IconComponents';

const WELCOME_MESSAGE: Message = {
    id: 'welcome-message',
    role: Role.MODEL,
    text: "Welcome! I am your AI assistant for Philippine Laws and Jurisprudence. Ask me anything about legal codes, statutes, or case law in the Philippines. How can I help you today?",
};


export const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: Role.USER,
            text: input,
        };
        
        const aiMessagePlaceholder: Message = {
            id: `model-${Date.now()}`,
            role: Role.MODEL,
            text: '',
        };

        setMessages(prev => [...prev, userMessage, aiMessagePlaceholder]);
        setInput('');
        setIsLoading(true);
        setError(null);
        
        const chatHistory = messages.filter(m => m.id !== 'welcome-message');

        await streamChatResponse(chatHistory, input, {
            onChunk: (chunk) => {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMessagePlaceholder.id
                            ? { ...msg, text: msg.text + chunk }
                            : msg
                    )
                );
            },
            onComplete: (fullResponse) => {
                const groundingChunks = fullResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
                const sources: Source[] = (groundingChunks || [])
                    .map((chunk: any) => ({ // Using any because the type is not exported
                        uri: chunk.web?.uri,
                        title: chunk.web?.title,
                    }))
                    .filter(source => source.uri && source.title);
                
                // Remove duplicate sources
                const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());


                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMessagePlaceholder.id
                            ? { ...msg, sources: uniqueSources }
                            : msg
                    )
                );
                setIsLoading(false);
            },
            onError: (err) => {
                 setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMessagePlaceholder.id
                            ? { ...msg, text: `Sorry, an error occurred: ${err.message}` }
                            : msg
                    )
                );
                setError(`Failed to get response. ${err.message}`);
                setIsLoading(false);
            }
        });
    };
    
    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full bg-stone-800/60 sm:rounded-lg shadow-2xl overflow-hidden">
            <div className="flex-grow p-4 sm:p-6 space-y-6 overflow-y-auto">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && messages[messages.length - 1].role === Role.MODEL && (
                    <div className="flex justify-start">
                        <div className="flex items-center space-x-2 bg-stone-700 p-3 rounded-lg rounded-bl-none">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                )}
                 <div ref={chatEndRef} />
            </div>
            <div className="p-3 sm:p-4 bg-stone-900/50 border-t border-stone-700">
                 {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a specific law..."
                        disabled={isLoading}
                        className="w-full bg-stone-700 border border-stone-600 rounded-lg px-4 py-3 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-shadow"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 sm:px-5 rounded-lg transition-colors flex items-center"
                    >
                       <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};