"use client";

import React, { useRef, useEffect, useState } from "react";
import { Mic, Wifi, XCircle, RotateCcw, Volume2, Clock } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useSocket } from "@/context/SocketContext";
import { useTranslations } from "next-intl";

// --- Custom Audio Waveform Component ---
function AudioWaveform({ stream, isPlaying }) {
    const canvasRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!stream || !isPlaying || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Initialize Web Audio API
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        analyserRef.current = audioCtxRef.current.createAnalyser();

        // Fast Fourier Transform size (determines number of frequency bins)
        analyserRef.current.fftSize = 128;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
        // Do NOT connect to destination to avoid feedback loop (the <audio> tag plays the sound)

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            // Responsive sizing
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] * (height / 255); // Normalize to canvas height

                // Color gradient based on frequency magnitude
                const hue = 150 + (barHeight / height) * 100; // Emerald/Teal to Reddish
                ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;

                // Draw vertically centered bars
                const y = (height - barHeight) / 2;

                // Draw with rounded caps
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth - 2, Math.max(4, barHeight), 4);
                ctx.fill();

                x += barWidth + 2;
            }
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (sourceRef.current) sourceRef.current.disconnect();
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(console.error);
            }
        };
    }, [stream, isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="w-full h-full"
        />
    );
}

export default function AmbientMicModal({ childId, childName, onClose }) {
    const t = useTranslations('WebRTC');
    const socket = useSocket();
    const audioRef = useRef(null);
    const [duration, setDuration] = useState(10); // Default 10 minutes
    const [isStarted, setIsStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    // We only pass isAudioOnly=true once the user actually starts the session
    // But hooks must be called unconditionally, so we initialize it with isAudioOnly=true
    // but we won't let it auto-initiate until isStarted is true? 
    // Wait, useWebRTC auto-starts on mount. We need to prevent auto-start.
    // Instead of refactoring useWebRTC completely, we can conditionally render the active phase.

    // Let's create an inner component to handle the actual stream so useWebRTC mounts when requested.
    if (!isStarted) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="bg-red-500 p-6 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <button onClick={onClose} className="text-white/80 hover:text-white transition"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                            <Mic className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white">{t("ambientMicTitle")}</h2>
                        <p className="text-red-100 mt-1">{t("listenTo", { name: childName })}</p>
                    </div>

                    <div className="p-6">
                        <p className="text-slate-600 dark:text-slate-400 text-sm text-center mb-6">
                            {t("micDurationDesc")}
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[5, 10, 30].map(mins => (
                                <button
                                    key={mins}
                                    onClick={() => setDuration(mins)}
                                    className={`py-3 px-2 rounded-xl border-2 font-bold transition flex flex-col items-center justify-center gap-1
                                        ${duration === mins
                                            ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600'
                                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-red-200'}`}
                                >
                                    <span className="text-xl">{mins}</span>
                                    <span className="text-xs font-medium uppercase tracking-wider">{t("minutes")}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                setTimeLeft(duration * 60);
                                setIsStarted(true);
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-red-500/30 transition transform hover:-translate-y-0.5"
                        >
                            {t("startListening")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ActiveMicStream
            t={t}
            childId={childId}
            childName={childName}
            duration={duration}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            onClose={onClose}
        />
    );
}

function ActiveMicStream({ t, childId, childName, duration, timeLeft, setTimeLeft, onClose }) {
    const socket = useSocket();
    const audioRef = useRef(null);
    const {
        stream,
        status,
        networkQuality,
        retryCount,
        isRetryExhausted,
        manualRetry
    } = useWebRTC(socket, childId, true); // true = isAudioOnly

    useEffect(() => {
        if (audioRef.current && stream) {
            console.log("[AmbientMic] Attaching audio stream");
            audioRef.current.srcObject = stream;
            audioRef.current.play().catch(e => console.error("Audio play error:", e));
        }
    }, [stream]);

    // Timer logic
    useEffect(() => {
        if (status !== 'connected' || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose(); // Automatically close when time is up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, timeLeft, setTimeLeft, onClose]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getStatusText = () => {
        switch (status) {
            case 'connecting': return t("connecting");
            case 'connected': return t("connectedAudio");
            case 'reconnecting': return t("reconnecting");
            case 'retrying': return t("retrying", { count: retryCount });
            case 'disconnected': return t("offline");
            case 'rejected': return t("rejected");
            default: return status;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300">
            {/* Audio Element */}
            <audio ref={audioRef} autoPlay playsInline />

            {/* Waveform Visualizer */}
            <div className="relative w-full max-w-md h-48 flex items-center justify-center mb-8">
                {status === 'connected' ? (
                    <div className="w-full h-full bg-slate-900/50 rounded-3xl border border-slate-700 shadow-inner overflow-hidden p-6 flex items-center">
                        <AudioWaveform stream={stream} isPlaying={status === 'connected'} />
                    </div>
                ) : (
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                        {status === 'connecting' && (
                            <>
                                <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                                <div className="absolute inset-4 border-2 border-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                            </>
                        )}
                        <div className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 bg-slate-800 border border-slate-700`}>
                            <Mic className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Status Information */}
            <div className="text-center max-w-sm w-full bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-xl backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white mb-2">{childName}'s Mic</h3>

                <p className={`text-sm font-medium mb-6 flex items-center justify-center gap-2
                    ${status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </span>
                    {getStatusText()}
                </p>

                {status === 'connected' && (
                    <div className="flex items-center justify-between bg-slate-900/80 rounded-2xl p-4 mb-2 border border-slate-700">
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Time Remaining</span>
                            <span className="text-2xl font-mono text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-red-400" /> {formatTime(timeLeft)}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Network</span>
                            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                                <Wifi className="w-4 h-4" /> {networkQuality}
                            </span>
                        </div>
                    </div>
                )}

                {(status === 'disconnected' || status === 'rejected') && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center mt-4 mb-2">
                        <p className="text-red-400 text-sm mb-3">
                            {status === 'rejected' ? t('permissionDenied') : t('exhausted')}
                        </p>
                        {(isRetryExhausted || status === 'rejected') && (
                            <button onClick={manualRetry} className="flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition">
                                <RotateCcw className="w-4 h-4" /> {t("retryBtn")}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* End Button */}
            <button
                onClick={onClose}
                className="mt-10 group relative flex flex-col items-center"
            >
                <div className="w-16 h-16 bg-red-600 group-hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/30 transition transform group-hover:scale-110">
                    <XCircle className="w-8 h-8" />
                </div>
                <span className="text-white text-sm font-bold mt-3 opacity-70 group-hover:opacity-100 transition">{t("endMic")}</span>
            </button>
        </div>
    );
}
