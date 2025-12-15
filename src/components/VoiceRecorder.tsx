import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
    onResult: (text: string) => void;
    onClose: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onResult, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                resetSilenceTimer();
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onresult = (event: any) => {
                resetSilenceTimer();
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech Error:", event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access denied.");
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
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
    };

    const resetSilenceTimer = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
            handleFinish();
        }, 3000); // Auto-finish after 3s of silence
    };

    const handleFinish = () => {
        stopListening();
        if (transcript.trim()) {
            onResult(transcript);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
            {/* Live Transcript */}
            <div className="w-full max-w-lg bg-black/20 backdrop-blur rounded-2xl p-6 min-h-[120px] max-h-[200px] overflow-y-auto border border-white/10 text-white text-lg font-medium text-center shadow-inner">
                {transcript || <span className="text-white/30 italic">Listening...</span>}
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <button
                    onClick={handleFinish}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-rose-600 rounded-full font-bold shadow-xl hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all"
                >
                    {isListening ? <Square size={20} fill="currentColor" /> : <Loader2 size={20} className="animate-spin" />}
                    <span>{isListening ? 'Stop & Process' : 'Processing...'}</span>
                </button>
            </div>
        </div>
    );
};
