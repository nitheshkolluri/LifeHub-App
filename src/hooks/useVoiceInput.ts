
import { useState, useCallback, useEffect, useRef } from 'react';

// Determine if we are browser side (safe check)
const isBrowser = typeof window !== 'undefined';

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const useVoiceInput = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isExplicitlyStopped = useRef(false);

    useEffect(() => {
        if (!isBrowser) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported in this browser.");
            setError('Browser not supported. Try Chrome or Safari.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true; // Essential for real-time feedback
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
                fullTranscript += event.results[i][0].transcript;
            }
            // Functional update ensures we don't need 'transcript' in dep array
            setTranscript(fullTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error("Voice Error:", event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow permissions.');
                setIsListening(false);
            } else if (event.error === 'no-speech') {
                // Ignore no-speech, it just means silence
            } else {
                setError(`Voice Error: ${event.error}`);
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            if (isExplicitlyStopped.current) {
                setIsListening(false);
            } else {
                // If not stopped by user (and no error), try to restart for continuous flow?
                // For now, let's just stop to be safe and avoid infinite loops if mic is broken.
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                isExplicitlyStopped.current = false;
                recognitionRef.current.start();
                setIsListening(true);
                setError(null);
            } catch (e) {
                console.warn('Speech recognition start failed (likely already running)', e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            try {
                isExplicitlyStopped.current = true;
                recognitionRef.current.stop();
                setIsListening(false);
            } catch (e) {
                console.error('Stop listening failed', e);
            }
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        error
    };
};
