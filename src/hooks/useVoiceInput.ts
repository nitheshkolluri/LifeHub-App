
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

    // Use useRef to keep the instance stable across renders
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!isBrowser) return;

        // Initialize only once
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let fullTranscript = '';
            // Reconstruct full transcript from all results (fixes data loss on pause)
            for (let i = 0; i < event.results.length; ++i) {
                fullTranscript += event.results[i][0].transcript;
            }
            setTranscript(fullTranscript);
        };

        recognition.onerror = (event: any) => {
            // Ignore common non-critical errors to prevent console spam
            if (event.error === 'no-speech') {
                setIsListening(false);
                return;
            }
            if (event.error === 'aborted') {
                setIsListening(false);
                return;
            }
            console.error('Speech recognition error', event.error);
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        // Cleanup
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                // Determine if already started? The browser throws error if started.
                recognitionRef.current.start();
                setIsListening(true);
                setError(null);
            } catch (e) {
                // If already started, ignore
                console.warn('Speech recognition already started or failed to start', e);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                // Abort is safer to completely kill the session and prevent restart/ghost results
                recognitionRef.current.abort();
                setIsListening(false);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

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
