
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { Mic, Square, Loader2, Sparkles, ArrowRight, Trash2, RotateCcw } from 'lucide-react';
import { ViewState } from '../types';

const VoiceDashboard = () => {
    const { processBrainDump, setView } = useApp();
    const { isListening, transcript, startListening, stopListening, resetTranscript, error: voiceError } = useVoiceInput();

    const [isProcessing, setIsProcessing] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // Derived State
    const hasTranscript = transcript.trim().length > 0;
    const isReviewMode = !isListening && hasTranscript && !isProcessing;

    const handleProcess = async () => {
        if (!hasTranscript) return;

        stopListening(); // Safety check
        setIsProcessing(true);
        setLocalError(null);

        try {
            const result = await processBrainDump(transcript);

            // Rejection / Zero-Action Handling
            if (result.entities.length === 0) {
                setLocalError(result.summary || "No actionable items found.");
                setIsProcessing(false);
                return; // Stay on screen so user can edit/retry
            }

            // Success Path
            resetTranscript();
            setTimeout(() => setView(ViewState.TASKS), 1000);
        } catch (e) {
            console.error(e);
            setLocalError('Processing failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 font-sans animate-fade-in relative overflow-hidden text-slate-800">

            {/* Ambient Background */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isListening ? 'opacity-30' : 'opacity-10'}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-xl flex flex-col items-center gap-10">

                {/* Header Text */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
                        {isListening ? 'Listening...' : isReviewMode ? 'Review & Organize' : isProcessing ? 'Organizing...' : 'Voice Note'}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        {isListening ? 'Speak freely. Capture everything.' : isReviewMode ? 'Ready to process your thoughts?' : isProcessing ? 'Magic is happening...' : 'Tap below to start recording.'}
                    </p>
                </div>

                {/* MAIN CONTROL AREA */}
                <div className="relative">

                    {/* 1. IDLE / RECORDING STATE */}
                    {!isReviewMode && !isProcessing && (
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`w-32 h-32 rounded-[40px] flex items-center justify-center shadow-2xl transition-all duration-300 ${isListening
                                ? 'bg-rose-500 shadow-rose-500/40 scale-110'
                                : 'bg-slate-900 shadow-slate-900/20 hover:scale-105 hover:bg-indigo-600'
                                }`}
                        >
                            {isListening ? (
                                <Square size={40} className="text-white fill-current animate-pulse" />
                            ) : (
                                <Mic size={40} className="text-white" />
                            )}
                        </button>
                    )}

                    {/* 2. PROCESSING STATE */}
                    {isProcessing && (
                        <div className="w-32 h-32 rounded-[40px] bg-white flex items-center justify-center shadow-xl border border-indigo-100">
                            <Loader2 size={40} className="text-indigo-600 animate-spin" />
                        </div>
                    )}

                </div>

                {/* TRANSCRIPT CARD (Visible when has text) */}
                {(hasTranscript || isProcessing) && (
                    <div className="w-full bg-white/90 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/50 animate-slide-up flex flex-col gap-6">

                        <div className="max-h-[30vh] overflow-y-auto">
                            <p className="text-2xl font-medium text-slate-800 leading-relaxed">
                                "{transcript}"
                            </p>
                        </div>

                        {/* REVIEW ACTIONS (Only show when NOT listening/processing) */}
                        {isReviewMode && (
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                <button
                                    onClick={resetTranscript}
                                    className="py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    <span>Discard</span>
                                </button>

                                <button
                                    onClick={handleProcess}
                                    className="py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={20} />
                                    <span>Organize</span>
                                </button>
                            </div>
                        )}

                        {/* RESUME (Optional small button) */}
                        {isReviewMode && (
                            <div className="text-center">
                                <button onClick={startListening} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-500 flex items-center justify-center gap-1 mx-auto">
                                    <RotateCcw size={12} /> Resume Recording
                                </button>
                            </div>
                        )}

                    </div>
                )}

                {/* Error Message */}
                {(voiceError || localError) && (
                    <div className="bg-rose-50 text-rose-600 px-6 py-3 rounded-xl font-bold text-sm animate-bounce">
                        {voiceError || localError}
                    </div>
                )}

            </div>
        </div>
    );
};

export default VoiceDashboard;
