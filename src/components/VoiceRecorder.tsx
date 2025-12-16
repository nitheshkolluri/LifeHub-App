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
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        startListening();
        return () => stopListening();
    }, []);

    const startListening = () => {
        try {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Voice not supported in this browser.");
                onClose();
                return;
            }

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
                if (!waitingForAction) {
                    setIsListening(false);
                }
            };

            recognition.onresult = (event: any) => {
                if (waitingForAction) return; // Ignore input while waiting? Or should we resume?
                // If user speaks while waiting, we should probably resume auto-magically, but let's stick to prompt for now.

                resetSilenceTimer();
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'not-allowed') {
                    onClose();
                }
            };

            recognition.start();
        } catch (e) {
            console.error("Start Voice Error", e);
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
        }, 6000); // 6s silence -> Prompt
    };

    const handleSilenceDetected = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
        setWaitingForAction(true);

        // Start Auto-Save Timer (Drafts logic)
        autoSaveTimerRef.current = setTimeout(() => {
            handleFinish(); // Auto-save after no response
        }, 10000); // 10s to respond
    };

    const handleResume = () => {
        setWaitingForAction(false);
        startListening();
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
            <div className={`w-full max-w-lg bg-black/20 backdrop-blur rounded-2xl p-6 min-h-[120px] max-h-[200px] overflow-y-auto border border-white/10 text-white text-lg font-medium text-center shadow-inner ${waitingForAction ? 'opacity-50 blur-[1px]' : ''}`}>
                {transcript || <span className="text-white/30 italic">Listening...</span>}
            </div>

            {/* Controls */}
            {!waitingForAction ? (
                <div className="flex gap-4">
                    <button
                        onClick={handleFinish}
                        className="flex items-center gap-2 px-8 py-4 bg-white text-rose-600 rounded-full font-bold shadow-xl hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all"
                    >
                        {isListening ? <Square size={20} fill="currentColor" /> : <Loader2 size={20} className="animate-spin" />}
                        <span>{isListening ? 'Stop & Process' : 'Processing...'}</span>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 animate-slide-up">
                    <p className="text-white font-bold text-lg drop-shadow-md">Still there?</p>
                    <div className="flex gap-4">
                        <button
                            onClick={handleResume}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold backdrop-blur border border-white/30 transition-all flex items-center gap-2"
                        >
                            <Mic size={18} /> Resume
                        </button>
                        <button
                            onClick={handleFinish}
                            className="px-6 py-3 bg-white text-emerald-600 rounded-full font-bold shadow-xl hover:bg-emerald-50 transition-all flex items-center gap-2"
                        >
                            <Loader2 size={18} className="animate-spin" /> Auto-Saving...
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
