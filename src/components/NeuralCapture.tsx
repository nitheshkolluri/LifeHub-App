
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { Mic, X, ArrowUp, Sparkles, Loader2, StopCircle } from 'lucide-react';
import { BrainDumpResult } from '../types';

interface NeuralCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

// Organic Blob Animation
const blobStyle = `
  @keyframes blob-pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
    70% { transform: scale(1.1); box-shadow: 0 0 0 40px rgba(99, 102, 241, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
  }
  .mic-blob {
    animation: blob-pulse 2s infinite;
  }
`;

export const NeuralCapture = ({ isOpen, onClose }: NeuralCaptureProps) => {
  const { processBrainDump } = useApp();
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'review' | 'success'>('idle');
  const [result, setResult] = useState<BrainDumpResult | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen]);

  const resetState = () => {
    setText('');
    setIsListening(false);
    setStatus('idle');
    setResult(null);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setText(transcript);
      };

      recognition.start();
    } else {
      alert("Voice input not supported in this browser.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleProcess = async () => {
    if (!text.trim()) return;
    setStatus('processing');
    try {
      const res = await processBrainDump(text);
      setResult(res);
      setStatus('review');
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  const handleConfirm = () => {
    setStatus('success');
    setTimeout(() => onClose(), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300 flex items-center justify-center p-4">
      <style>{blobStyle}</style>

      {/* Close Button */}
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-20">
        <X size={20} />
      </button>

      {/* --- SUCCESS STATE --- */}
      {status === 'success' && (
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
            <Sparkles size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">Captured</h2>
          <p className="text-slate-500 font-medium mt-2">Your Second Brain has been updated.</p>
        </div>
      )}

      {/* --- REVIEW STATE --- */}
      {status === 'review' && result && (
        <div className="w-full max-w-lg animate-slide-up">
          <h2 className="text-2xl font-black text-white mb-6 text-center">Neural Parse Result</h2>
          <div className="space-y-3 mb-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            {result.entities.map((entity, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-[24px] flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold text-lg
                      ${entity.type === 'finance' ? 'bg-amber-500/20 text-amber-400' : entity.type === 'habit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}
                   `}>
                  {entity.type === 'finance' ? '$' : entity.type === 'habit' ? 'H' : 'T'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{entity.data.title}</h4>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{entity.type} • {Math.round(entity.confidence * 100)}% Match</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleConfirm} className="w-full bg-white text-slate-900 py-5 rounded-[24px] font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            Confirm & Save
          </button>
        </div>
      )}

      {/* --- CAPTURE STATE --- */}
      {(status === 'idle' || status === 'processing') && (
        <div className="w-full max-w-2xl flex flex-col items-center">

          {/* Visualizer / Mic */}
          <div className="relative mb-12">
            {isListening ? (
              <div className="w-40 h-40 bg-indigo-500 rounded-full mic-blob flex items-center justify-center cursor-pointer" onClick={stopListening}>
                <StopCircle size={48} className="text-white" />
              </div>
            ) : (
              <button
                onClick={startListening}
                className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors shadow-2xl shadow-indigo-500/20"
              >
                <Mic size={40} className="text-indigo-400" />
              </button>
            )}
          </div>

          {/* Text Input Area */}
          <div className="w-full relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tap the mic or type here..."
              className="w-full bg-transparent text-center text-3xl md:text-4xl font-bold text-white placeholder:text-slate-600 border-none focus:ring-0 resize-none h-48"
              disabled={status === 'processing'}
            />

            {status === 'processing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                <Loader2 size={40} className="text-indigo-500 animate-spin" />
              </div>
            )}
          </div>

          {/* Action Bar */}
          {text && status !== 'processing' && (
            <button
              onClick={handleProcess}
              className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 shadow-lg shadow-indigo-500/40 hover:scale-105 transition-transform animate-scale-in"
            >
              <Sparkles size={20} />
              <span>Process Thought</span>
            </button>
          )}

          <p className="mt-8 text-slate-500 text-sm font-medium">
            {isListening ? "Listening... Speak naturally." : "Try: \"Remind me to pay rent on Friday and start jogging daily\""}
          </p>
        </div>
      )}
    </div>
  );
};
