import React from 'react';
import type { Message } from '../types';
import { Role } from '../types';
import { UserIcon, BotIcon, LinkIcon } from './IconComponents';
import { SourcePill } from './SourcePill';

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isModel = message.role === Role.MODEL;

    const messageContainerClasses = isModel
        ? 'justify-start'
        : 'justify-end';
    
    const messageBubbleClasses = isModel
        ? 'bg-stone-700 text-stone-200 rounded-lg rounded-bl-none'
        : 'bg-amber-800 text-white rounded-lg rounded-br-none';

    const IconComponent = isModel ? BotIcon : UserIcon;

    // Use a simple markdown-like parser for bold text.
    const formatText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className={`flex items-start gap-3 ${messageContainerClasses}`}>
            {isModel && <IconComponent className="w-8 h-8 flex-shrink-0 text-amber-400 bg-stone-800 p-1.5 rounded-full" />}
            <div className="max-w-xl">
                <div className={`px-4 py-3 ${messageBubbleClasses} shadow-md`}>
                    <p className="whitespace-pre-wrap">{formatText(message.text)}</p>
                </div>
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-3">
                        <h4 className="text-xs font-semibold text-stone-400 flex items-center gap-1.5 mb-2">
                           <LinkIcon className="w-3 h-3" />
                           Sources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {message.sources.map(source => (
                                <SourcePill key={source.uri} source={source} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
             {!isModel && <IconComponent className="w-8 h-8 flex-shrink-0 text-amber-200 bg-stone-700 p-1.5 rounded-full" />}
        </div>
    );
};