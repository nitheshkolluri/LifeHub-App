
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { useUsage } from '../store/UsageContext';
import { Send, Bot, User, Mic, MicOff, X, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { ViewState } from '../types';

export const Assistant = () => {
  const { messages, setMessages, sendChatMessage, isLoadingAI, setView } = useApp();
  const { usageCount, isPremium, setShowPaywall, incrementUsage } = useUsage();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [saveToMemory, setSaveToMemory] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Voice Logic Refs
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textBeforeRef = useRef('');

  // 1. Auto-Clear Chat on Mount
  useEffect(() => {
    setMessages([{ id: 'init', role: 'system', text: "Hello! I'm LifeHub. I'm here to listen. This chat will disappear when you leave, so let me know if you want me to remember anything." }]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAI]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopListening();
  }, []);

  // -- Handlers --
  const handleExitRequest = () => {
    if (messages.length > 1) {
      setShowExitWarning(true);
    } else {
      setView(ViewState.DASHBOARD);
    }
  };

  const confirmExit = (shouldSave: boolean) => {
    if (shouldSave) {
      // Logic to "Save" could go here (e.g. summarize to Brain Dump), 
      // but for now we just acknowledge and exit as per user request just "toggle" memory
      // API call to memory service could happen here
    }
    setView(ViewState.DASHBOARD);
  };

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

      // recognition.lang = 'en-US'; // Allow Multi-Language Support (Defaults to Device Lang)
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

    incrementUsage();

    stopListening(); // Stop listening on send
    const text = input;
    setInput('');
    await sendChatMessage(text);
  };

  if (showExitWarning) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Leave Chat?</h3>
            <p className="text-slate-500 font-medium">This thread will be lost forever. Do you want to save this context to your Memory?</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => confirmExit(true)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Save size={18} />
              <span>Save to Memory & Exit</span>
            </button>
            <button
              onClick={() => confirmExit(false)}
              className="w-full py-4 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl transition-all"
            >
              Just Exit
            </button>
            <button
              onClick={() => setShowExitWarning(false)}
              className="text-sm font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] animate-slide-up relative">

      {/* Header with Memory Toggle & Exit */}
      <div className="flex items-center justify-between mb-4 bg-white/60 backdrop-blur-md p-2 rounded-full border border-white/50 shadow-sm">
        <button
          onClick={handleExitRequest}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:block">Session Mode</span>
          {/* Memory Toggle */}
          <button
            onClick={() => setSaveToMemory(!saveToMemory)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${saveToMemory ? 'bg-indigo-500 text-white shadow-indigo-200 shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            <div className={`w-2 h-2 rounded-full ${saveToMemory ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-xs font-bold">{saveToMemory ? 'Memory ON' : 'Memory OFF'}</span>
          </button>
        </div>

        {/* Mobile-only close button -> Mapped to same Exit Request */}
        <button
          onClick={handleExitRequest}
          className="md:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-[32px] bg-white/40 border border-white/50 shadow-inner p-4 md:p-6 space-y-6 scroll-smooth backdrop-blur-sm">
        {(Array.isArray(messages) ? messages : []).slice(1).map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`flex items-end max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white' : 'bg-white text-primary-600'
                }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={20} />}
              </div>
              <div className={`px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-md ${msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-br-sm'
                : 'bg-white/90 backdrop-blur text-slate-800 rounded-bl-sm border border-white'
                }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoadingAI && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center space-x-2 ml-14 bg-white/80 px-6 py-4 rounded-[24px] rounded-bl-sm border border-white shadow-sm">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 relative flex items-center gap-3">
        <div className="relative flex-1 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask your AI Assistant..."}
            className="w-full pl-6 pr-14 py-4 rounded-2xl border-0 bg-white/80 backdrop-blur shadow-lg shadow-primary-500/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-800 placeholder:text-slate-400 transition-all font-medium"
            disabled={isLoadingAI}
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all duration-300 ${isListening ? 'text-white bg-rose-500 animate-pulse shadow-lg shadow-rose-500/30' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'
              }`}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoadingAI}
          className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Send size={20} className={input.trim() ? "ml-0.5" : ""} />
        </button>
      </form>
    </div>
  );
};