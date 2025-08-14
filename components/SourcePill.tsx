import React from 'react';
import type { Source } from '../types';

interface SourcePillProps {
    source: Source;
}

export const SourcePill: React.FC<SourcePillProps> = ({ source }) => {
    return (
        <a
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            title={source.title}
            className="bg-stone-600 hover:bg-stone-500 text-amber-300 text-xs px-3 py-1 rounded-full transition-colors truncate max-w-xs"
        >
            {source.title}
        </a>
    );
};