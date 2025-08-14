import React from 'react';
import { ChatInterface } from './components/ChatInterface';
import { ScaleIcon } from './components/IconComponents';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-300 font-sans flex flex-col">
      <header className="bg-stone-800/50 backdrop-blur-sm border-b border-stone-700 px-4 py-3 sm:p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3 sm:gap-4">
          <ScaleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">Philippine Legal Eagle AI</h1>
            <p className="text-xs sm:text-sm text-stone-400">Your RAG-powered assistant for Philippine Laws & Jurisprudence</p>
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col sm:p-4 overflow-hidden">
        <ChatInterface />
      </main>
      <footer className="text-center p-4 text-xs text-stone-500">
        <p>Not Legal Advice. Please use this for learning purposes.</p>
      </footer>
    </div>
  );
};

export default App;