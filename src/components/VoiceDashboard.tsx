
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { Mic, MicOff, Terminal, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { ViewState } from '../types';

const VoiceDashboard = () => {
    const { processBrainDump, currentView, setView } = useApp();
    const { user } = useAuth();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<string>('Ready to listen');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setStatus('Listening...');
                setError(null);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (status !== 'Processing...') {
                    setStatus('Tap microphone to start');
                }
            };

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + ' ' + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech Error:", event.error);
                setError(event.error === 'not-allowed' ? 'Microphone access denied' : 'Error recognizing speech');
                setIsListening(false);
            };

        } else {
            setError("Voice input not supported in this browser.");
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setTranscript('');
            recognitionRef.current.start();
        }
    };

    const handleProcess = async () => {
        if (!transcript.trim()) return;

        // Stop listening if active
        if (isListening) recognitionRef.current.stop();

        setIsProcessing(true);
        setStatus('Organizing your thoughts...');

        try {
            await processBrainDump(transcript);
            setStatus('Done! Organizing...');
            setTranscript('');
            setTimeout(() => setView(ViewState.TASKS), 1000);
        } catch (e) {
            console.error(e);
            setStatus('Failed to process. Try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 font-sans animate-fade-in relative overflow-hidden">

            {/* Background Ambient Mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-[100px] transition-all duration-1000 ${isListening ? 'scale-150 opacity-40' : 'scale-100 opacity-20'}`} />
            </div>

            <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">
                        What's on your mind?
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Speak freely. We'll organize it.
                    </p>
                </div>

                {/* VISUALIZER / MICROPHONE */}
                <button
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl group ${isListening
                        ? 'bg-rose-500 shadow-rose-500/50 scale-110'
                        : isProcessing
                            ? 'bg-indigo-500 shadow-indigo-500/50 scale-90'
                            : 'bg-slate-900 shadow-slate-900/30 hover:scale-105'
                        }`}
                >
                    {/* Ripple Effects when Listening */}
                    {isListening && (
                        <>
                            <div className="absolute inset-0 border-4 border-rose-400 rounded-full animate-ping opacity-20" style={{ animationDuration: '1.5s' }} />
                            <div className="absolute inset-0 border-4 border-rose-400 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                        </>
                    )}

                    {isProcessing ? (
                        <Loader2 size={48} className="text-white animate-spin" />
                    ) : isListening ? (
                        <MicOff size={48} className="text-white" />
                    ) : (
                        <Mic size={48} className="text-white group-hover:scale-110 transition-transform" />
                    )}
                </button>

                {/* Status Text */}
                <div className="h-8 flex items-center justify-center gap-2">
                    {error ? (
                        <span className="text-rose-500 font-bold flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
                    ) : (
                        <span className={`font-bold uppercase tracking-widest text-sm transition-colors ${isListening ? 'text-rose-500' : 'text-slate-400'}`}>
                            {status}
                        </span>
                    )}
                </div>

                {/* Live Transcript Display */}
                {(transcript || isListening) && (
                    <div className="w-full bg-white/60 backdrop-blur-xl rounded-[32px] p-6 shadow-xl border border-white/50 min-h-[120px] relative animate-slide-up">
                        <div className="absolute -top-3 left-6 flex gap-2">
                            <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Live Input</span>
                        </div>
                        <p className="text-xl font-medium text-slate-700 leading-relaxed">
                            {transcript || <span className="text-slate-300 italic">Listening for speech...</span>}
                        </p>

                        {/* Action Bar */}
                        {transcript && !isProcessing && (
                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setTranscript('')}
                                    className="px-4 py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleProcess}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Sparkles size={16} />
                                    <span>Organize This</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Suggestions */}
                {!transcript && !isListening && (
                    <div className="flex flex-wrap justify-center gap-3 opacity-60">
                        {["Buy milk tomorrow", "Pay rent on Tuesday", "Meditate daily"].map(hint => (
                            <span key={hint} className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-400 border border-slate-100">
                                "{hint}"
                            </span>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default VoiceDashboard;
