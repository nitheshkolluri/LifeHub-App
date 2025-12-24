import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
    onResult: (text: string) => void;
    onClose: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onResult, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [waitingForAction, setWaitingForAction] = useState(false);
    const recognitionRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        startListening();
        return () => stopListening();
    }, []);

    const startListening = async () => {
        try {
            // 1. Explicitly request mic permission for iOS/PWA context
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // 2. Setup Speech Recognition
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognitionRef.current = recognition;
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = navigator.language || 'en-US';

                recognition.onstart = () => {
                    setIsListening(true);
                    setWaitingForAction(false);
                    resetSilenceTimer();
                };

                recognition.onend = () => {
                    if (!waitingForAction && isListening) {
                        try {
                            recognition.start(); // Auto-restart checks
                        } catch (e) {
                            // Ignore
                        }
                    }
                };

                recognition.onresult = (event: any) => {
                    if (waitingForAction) return;
                    resetSilenceTimer();
                    let currentTranscript = '';
                    for (let i = 0; i < event.results.length; ++i) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(currentTranscript);
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech Rec Error", event.error);
                    if (event.error === 'not-allowed') {
                        onClose();
                    }
                };

                recognition.start();
            } else {
                console.warn("Speech Recognition not supported.");
                alert("Voice to text not supported on this browser.");
                onClose();
            }

        } catch (e) {
            console.error("Start Voice Error", e);
            alert("Microphone access denied. Please check system settings.");
            onClose();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        clearTimers();
    };

    const clearTimers = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };

    const resetSilenceTimer = () => {
        clearTimers();
        silenceTimerRef.current = setTimeout(() => {
            handleSilenceDetected();
        }, 5000);
    };

    const handleSilenceDetected = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
        setWaitingForAction(true);

        autoSaveTimerRef.current = setTimeout(() => {
            handleFinish();
        }, 8000);
    };

    const handleResume = () => {
        setWaitingForAction(false);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) { /* ignore */ }
        }
    };

    const handleFinish = () => {
        stopListening();
        if (transcript.trim().length > 0) {
            onResult(transcript);
        } else {
            onClose();
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full animate-fade-in relative transition-all duration-500">
            {/* Live Transcript */}
            <div className={`w-full max-w-lg bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-6 min-h-[120px] max-h-[200px] overflow-y-auto border border-white/10 text-white text-lg font-medium text-center shadow-2xl ${waitingForAction ? 'opacity-50 blur-[1px]' : ''}`}>
                {transcript || <div className="flex flex-col items-center gap-2 text-white/40"><Mic size={24} className="animate-pulse" /><span className="text-sm">Listening...</span></div>}
            </div>

            {/* Controls */}
            {!waitingForAction ? (
                <div className="flex gap-4">
                    <button
                        onClick={handleFinish}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-zinc-900 rounded-full font-bold shadow-lg shadow-zinc-900/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        {isListening ? <Square size={18} fill="currentColor" /> : <Loader2 size={18} className="animate-spin" />}
                        <span>{isListening ? 'Stop & Process' : 'Finalizing...'}</span>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 animate-slide-up">
                    <p className="text-white font-bold text-lg drop-shadow-md">Finished speaking?</p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleResume}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold backdrop-blur border border-white/20 transition-all flex items-center gap-2 text-sm"
                        >
                            <Mic size={16} /> Resume
                        </button>
                        <button
                            onClick={handleFinish}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full font-bold shadow-lg transition-all flex items-center gap-2 text-sm"
                        >
                            <span>Process Note</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
