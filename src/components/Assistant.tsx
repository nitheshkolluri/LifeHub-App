
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { useUsage } from '../store/UsageContext';
import { Send, Bot, User, Mic, MicOff, X } from 'lucide-react';
import { ViewState } from '../types';

export const Assistant = () => {
  const { messages, sendChatMessage, isLoadingAI, setView } = useApp();
  const { usageCount, isPremium, setShowPaywall, incrementUsage } = useUsage();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Voice Logic Refs
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textBeforeRef = useRef('');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAI]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopListening();
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      // SAFETY: Explicitly stop any existing instance before creating a new one
      if (recognitionRef.current) {
        recognitionRef.current.abort(); // abort() kills it immediately
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      textBeforeRef.current = input;

      recognition.onstart = () => {
        console.log("Voice: Recognition started");
        setIsListening(true);
        resetSilenceTimer();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognition.onresult = (event: any) => {
        resetSilenceTimer();

        let currentTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }

        const prefix = textBeforeRef.current ? textBeforeRef.current + ' ' : '';
        setInput(prefix + currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        stopListening();
      };

      recognition.start();
    }
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      stopListening();
    }, 60000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoadingAI) return;

    // Enforce Usage Limit
    if (!isPremium && usageCount >= 3) {
      setShowPaywall(true);
      return;
    }
    incrementUsage();

    stopListening(); // Stop listening on send
    const text = input;
    setInput('');
    await sendChatMessage(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] animate-slide-up relative">

      {/* Mobile Header with Close Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="glass px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Assistant Online</span>
        </div>

        {/* Mobile-only close button */}
        <button
          onClick={() => setView(ViewState.DASHBOARD)}
          className="md:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:bg-slate-50"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-[32px] bg-white/50 border border-white shadow-inner p-4 md:p-6 space-y-6 scroll-smooth">
        {messages.slice(1).map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end max-w-[85%] md:max-w-[70%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'
                }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
              </div>
              <div className={`px-5 py-3.5 rounded-[24px] text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoadingAI && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 ml-10 bg-white px-4 py-3 rounded-[24px] rounded-bl-none border border-slate-100 shadow-sm">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 relative flex items-center gap-2 px-1">
        <div className="relative flex-1 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type a message..."}
            className="w-full pl-6 pr-12 py-4 rounded-full border-0 bg-white shadow-lg shadow-indigo-100/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder:text-slate-400 transition-all font-medium"
            disabled={isLoadingAI}
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'text-rose-500 bg-rose-50 animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoadingAI}
          className="p-4 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Send size={20} className={input.trim() ? "ml-0.5" : ""} />
        </button>
      </form>
    </div>
  );
};