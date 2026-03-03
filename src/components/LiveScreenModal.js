"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Monitor, Wifi, WifiOff, XCircle, RefreshCcw, Moon, ShieldAlert, Loader2 } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

export default function LiveScreenModal({ childId, childName, onClose }) {
    const socket = useSocket();
    const imgRef = useRef(null);
    const [status, setStatus] = useState('connecting');   // connecting | streaming | screen_off | secure_content | error | reconnecting
    const [errorMessage, setErrorMessage] = useState('');
    const [frameCount, setFrameCount] = useState(0);
    const [fps, setFps] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const lastFrameTime = useRef(Date.now());
    const noFrameTimer = useRef(null);
    const timerInterval = useRef(null);
    const fpsInterval = useRef(null);
    const frameCountRef = useRef(0);
    const reconnectAttempts = useRef(0);
    const isMounted = useRef(true);

    // --- Start screen view on mount ---
    useEffect(() => {
        isMounted.current = true;

        if (!socket || !childId) return;

        // Request screen view
        socket.emit("start_screen_view", { childId });
        setStatus('connecting');

        // Listen for screen frames
        const handleFrame = (data) => {
            if (!isMounted.current) return;
            const { frame } = data;
            if (imgRef.current && frame) {
                imgRef.current.src = `data:image/jpeg;base64,${frame}`;
                setStatus('streaming');
                frameCountRef.current += 1;
                setFrameCount(prev => prev + 1);
                lastFrameTime.current = Date.now();
                reconnectAttempts.current = 0; // reset on successful frame

                // Reset no-frame timer (15s timeout — allows for slow networks + backoff)
                clearTimeout(noFrameTimer.current);
                noFrameTimer.current = setTimeout(() => {
                    if (isMounted.current && reconnectAttempts.current < 3) {
                        reconnectAttempts.current++;
                        setStatus('reconnecting');
                        socket.emit("start_screen_view", { childId });
                    }
                }, 15000);
            }
        };

        // Listen for screen status updates
        const handleStatus = (data) => {
            if (!isMounted.current) return;
            const { status: newStatus, message } = data;
            switch (newStatus) {
                case 'streaming':
                    setStatus('streaming');
                    break;
                case 'screen_off':
                    setStatus('screen_off');
                    break;
                case 'secure_content':
                    setStatus('secure_content');
                    break;
                case 'stopped':
                    setStatus('connecting');
                    break;
                case 'error':
                    setStatus('error');
                    setErrorMessage(message || 'Unknown error');
                    break;
                default:
                    break;
            }
        };

        socket.on("screen_frame", handleFrame);
        socket.on("screen_status", handleStatus);

        // FPS counter: calculate every second
        fpsInterval.current = setInterval(() => {
            if (!isMounted.current) return;
            setFps(frameCountRef.current);
            frameCountRef.current = 0;
        }, 1000);

        // Elapsed time counter
        timerInterval.current = setInterval(() => {
            if (!isMounted.current) return;
            setElapsedSeconds(prev => prev + 1);
        }, 1000);

        return () => {
            isMounted.current = false;
            socket.off("screen_frame", handleFrame);
            socket.off("screen_status", handleStatus);
            socket.emit("stop_screen_view", { childId });
            clearTimeout(noFrameTimer.current);
            clearInterval(timerInterval.current);
            clearInterval(fpsInterval.current);
        };
    }, [socket, childId]);

    // --- Manual retry ---
    const handleRetry = useCallback(() => {
        if (!socket || !childId) return;
        setStatus('connecting');
        setErrorMessage('');
        setFrameCount(0);
        setElapsedSeconds(0);
        socket.emit("start_screen_view", { childId });
    }, [socket, childId]);

    // --- Format timer ---
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Status text (Bangla + English) ---
    const getStatusInfo = () => {
        switch (status) {
            case 'connecting':
                return {
                    text: "Requesting screen... / স্ক্রিন অনুরোধ করা হচ্ছে...",
                    color: "text-amber-400",
                    Icon: Loader2,
                    animate: true,
                };
            case 'streaming':
                return {
                    text: "Live Screen Active / লাইভ স্ক্রিন চলছে",
                    color: "text-emerald-400",
                    Icon: Monitor,
                    animate: false,
                };
            case 'screen_off':
                return {
                    text: "Child's screen is off / সন্তানের স্ক্রিন বন্ধ আছে",
                    color: "text-blue-400",
                    Icon: Moon,
                    animate: false,
                };
            case 'secure_content':
                return {
                    text: "Protected app (banking etc.) / সুরক্ষিত অ্যাপ",
                    color: "text-orange-400",
                    Icon: ShieldAlert,
                    animate: false,
                };
            case 'error':
                return {
                    text: `Error: ${errorMessage} / ত্রুটি`,
                    color: "text-red-400",
                    Icon: WifiOff,
                    animate: false,
                };
            case 'reconnecting':
                return {
                    text: "Reconnecting... / পুনরায় সংযোগ হচ্ছে...",
                    color: "text-amber-400",
                    Icon: RefreshCcw,
                    animate: true,
                };
            default:
                return {
                    text: status,
                    color: "text-gray-400",
                    Icon: Monitor,
                    animate: false,
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
            {/* Header Bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Monitor size={18} style={{ color: '#a78bfa' }} />
                    <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '15px' }}>
                        {childName || 'Child'} — Screen View
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* FPS Badge */}
                    {status === 'streaming' && (
                        <span style={{
                            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: '6px', padding: '3px 8px', fontSize: '12px',
                            color: '#6ee7b7', fontWeight: 600,
                        }}>
                            {fps} FPS
                        </span>
                    )}

                    {/* Timer */}
                    <span style={{
                        color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace',
                    }}>
                        {formatTime(elapsedSeconds)}
                    </span>

                    {/* Close Button */}
                    <button onClick={onClose} style={{
                        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex',
                    }}>
                        <XCircle size={20} style={{ color: '#f87171' }} />
                    </button>
                </div>
            </div>

            {/* Screen Image */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '60px 20px 80px',
            }}>
                {status === 'connecting' || status === 'reconnecting' ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                    }}>
                        <Loader2 size={48} style={{
                            color: '#a78bfa', animation: 'spin 1s linear infinite',
                        }} />
                        <p style={{ color: '#94a3b8', fontSize: '15px', textAlign: 'center' }}>
                            {statusInfo.text}
                        </p>
                    </div>
                ) : status === 'error' ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                    }}>
                        <WifiOff size={48} style={{ color: '#f87171' }} />
                        <p style={{ color: '#f87171', fontSize: '15px', textAlign: 'center' }}>
                            {statusInfo.text}
                        </p>
                        <button onClick={handleRetry} style={{
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            border: 'none', borderRadius: '10px', padding: '10px 24px',
                            color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                            <RefreshCcw size={16} /> Retry / পুনরায় চেষ্টা
                        </button>
                    </div>
                ) : status === 'screen_off' ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                    }}>
                        <Moon size={48} style={{ color: '#60a5fa' }} />
                        <p style={{ color: '#93c5fd', fontSize: '15px', textAlign: 'center' }}>
                            {statusInfo.text}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>
                            Waiting for screen to turn on... / স্ক্রিন চালু হওয়ার অপেক্ষায়...
                        </p>
                    </div>
                ) : (
                    <img
                        ref={imgRef}
                        alt="Child Screen"
                        style={{
                            maxWidth: '100%', maxHeight: '100%',
                            objectFit: 'contain', borderRadius: '8px',
                            boxShadow: '0 0 40px rgba(124,58,237,0.15)',
                        }}
                    />
                )}
            </div>

            {/* Bottom Status Bar */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '12px 20px',
                background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
            }}>
                <statusInfo.Icon
                    size={14}
                    className={statusInfo.animate ? 'animate-spin' : ''}
                    style={{
                        color: statusInfo.color === 'text-emerald-400' ? '#6ee7b7' :
                            statusInfo.color === 'text-amber-400' ? '#fbbf24' :
                                statusInfo.color === 'text-red-400' ? '#f87171' :
                                    statusInfo.color === 'text-blue-400' ? '#93c5fd' :
                                        statusInfo.color === 'text-orange-400' ? '#fb923c' : '#94a3b8'
                    }}
                />
                <span style={{
                    fontSize: '13px',
                    color: statusInfo.color === 'text-emerald-400' ? '#6ee7b7' :
                        statusInfo.color === 'text-amber-400' ? '#fbbf24' :
                            statusInfo.color === 'text-red-400' ? '#f87171' :
                                statusInfo.color === 'text-blue-400' ? '#93c5fd' :
                                    statusInfo.color === 'text-orange-400' ? '#fb923c' : '#94a3b8',
                }}>
                    {statusInfo.text}
                </span>
            </div>

            {/* CSS animation for spinner */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
