import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Sparkles, Mic, MicOff } from 'lucide-react';

interface Props {
  userName: string;
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

export const BrainDump: React.FC<Props> = ({ userName, onAnalyze, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // Auto-detect language or default to generic
      recognitionRef.current.lang = 'zh-CN'; // Defaulting to Chinese given the PRD context, but browser often auto-detects

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
         // Keep listening if state says so, unless explicitly stopped
         if (isListening) {
             // recognitionRef.current.start(); 
             // Note: Re-starting automatically can be tricky with browser policies, 
             // so we usually let it stop and require user toggle for better UX.
             setIsListening(false);
         }
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support voice input.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 flex flex-col h-[80vh] justify-center animate-in fade-in duration-700">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-light text-morandi-text">Hi, {userName}.</h2>
          <p className="text-stone-500 mt-2">
            Don't worry about structure. Just dump what's making you anxious. Type it out or just speak your mind.
          </p>
        </div>

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., I need to research competitors for my startup but I don't know where to start..."
            className="w-full h-48 p-6 bg-white rounded-2xl border border-stone-100 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-morandi-sage text-lg leading-relaxed placeholder:text-stone-300 transition-all"
          />
          
          <button 
            onClick={toggleListening}
            className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-50 text-red-500 animate-pulse ring-2 ring-red-100' 
                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
            }`}
            title="Voice Input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={() => onAnalyze(input)} 
            disabled={!input.trim() || isLoading}
            size="lg"
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" /> De-tangling...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Untangle this for me
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};