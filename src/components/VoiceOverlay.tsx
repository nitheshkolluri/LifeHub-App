import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface VoiceOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ isOpen, onClose }) => {
    const { processBrainDump } = useApp();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('Listening...');
    const [isProcessing, setIsProcessing] = useState(false);

    // Voice styling
    const orbStyles = `
        @keyframes pulse-ring {
            0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 30px rgba(99, 102, 241, 0); }
            100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .orb-container {
            animation: float 4s ease-in-out infinite;
        }
        .orb {
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(99,102,241,1) 40%, rgba(67,56,202,1) 100%);
            box-shadow: 0 0 60px rgba(99, 102, 241, 0.6);
            transition: all 0.5s ease;
        }
        .orb.listening {
            animation: pulse-ring 2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(244,63,94,1) 40%, rgba(190,18,60,1) 100%);
            box-shadow: 0 0 80px rgba(244, 63, 94, 0.8);
        }
         .orb.processing {
            animation: pulse-ring 1s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(16,185,129,1) 40%, rgba(4,120,87,1) 100%);
            box-shadow: 0 0 80px rgba(16, 185, 129, 0.8);
        }
    `;

    const recognitionRef = useRef<any>(null);
    const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!isOpen) {
            stopListening();
            setTranscript('');
            setStatus('Listening...');
            setIsProcessing(false);
            return;
        }

        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setStatus('Listening...');
            };

            recognitionRef.current.onend = () => {
                // If closed manually or processing, don't auto-restart
                // But if silence stopped it, maybe we check status? 
                // For now, simpler is better: stop changes state.
                if (!isProcessing && isOpen && isListening) {
                    // It stopped unexpectedly?
                    setIsListening(false);
                }
            };

            recognitionRef.current.onresult = (event: any) => {
                // Clear silence timer on speech
                if (silenceTimer.current) clearTimeout(silenceTimer.current);

                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript || interimTranscript) {
                    setTranscript(prev => {
                        // Only append final, keep interim separate in UI if we wanted, 
                        // but effectively we just want to show the full stream.
                        // Simplification: We'll just show what we have. 
                        // Ideally: prev + final. 
                        // But `onresult` fires multiple times.
                        // Let's rely on event structure. 
                        // Re-building full transcript from 0 is safer if continuous=true sometimes.
                        // Actually, standard pattern:
                        return (finalTranscript ? prev + ' ' + finalTranscript : prev) + (interimTranscript ? ' ' + interimTranscript : '');
                        // This is buggy with state. Better: just show interim as live feedback.
                    });

                    // Reset silence timer (Auto-submit after 2s of silence)
                    silenceTimer.current = setTimeout(() => {
                        handleProcessing(finalTranscript || interimTranscript);
                    }, 2000);
                }

                // Better State Management for Display
                // Let's just blindly show the latest blob for now for visual feedback
                const fullText = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join('');
                setTranscript(fullText);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech Error", event.error);
                if (event.error === 'not-allowed') {
                    setStatus("Microphone Blocked");
                }
            };

            recognitionRef.current.start();
        } else {
            setStatus("Voice not supported");
        }

        return () => {
            stopListening();
        };

    }, [isOpen]);

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        setIsListening(false);
    };

    const handleProcessing = async (textToProcess?: string) => {
        const text = textToProcess || transcript;
        if (!text.trim()) return;

        stopListening();
        setIsProcessing(true);
        setStatus('Processing...');

        try {
            await processBrainDump(text);
            setStatus('Organized!');
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error(error);
            setStatus('Failed. Try again.');
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-300">
            <style>{orbStyles}</style>

            <button
                onClick={onClose}
                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
                <X size={24} />
            </button>

            <div className="orb-container mb-12 relative cursor-pointer" onClick={() => isListening ? stopListening() : recognitionRef.current?.start()}>
                <div className={`orb w-48 h-48 flex items-center justify-center ${isProcessing ? 'processing' : isListening ? 'listening' : ''}`}>
                    {isProcessing ? (
                        <Loader2 size={48} className="text-white animate-spin" />
                    ) : isListening ? (
                        <Mic size={48} className="text-white" />
                    ) : (
                        <MicOff size={48} className="text-white/50" />
                    )}
                </div>
            </div>

            <div className="w-full max-w-2xl px-8 text-center space-y-6">
                <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200 tracking-tight">
                    {status}
                </h2>

                <p className={`text-xl md:text-2xl text-white/80 font-medium leading-relaxed min-h-[100px] transition-all duration-300 ${isListening ? 'opacity-100' : 'opacity-50 blur-[1px]'}`}>
                    "{transcript || "Go ahead, I'm listening..."}"
                </p>

                {transcript && !isProcessing && (
                    <button
                        onClick={() => handleProcessing()}
                        className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                    >
                        <Sparkles size={20} />
                        Organize Thoughts
                    </button>
                )}
            </div>

            {isListening && (
                <div className="absolute bottom-12 text-white/40 text-sm font-medium tracking-widest uppercase animate-pulse">
                    Auto-detecting silence...
                </div>
            )}
        </div>
    );
};
