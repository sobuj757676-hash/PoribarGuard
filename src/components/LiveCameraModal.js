"use client";

import React, { useRef, useEffect } from "react";
import { Camera, Wifi, RefreshCcw, XCircle, RotateCcw } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useSocket } from "@/context/SocketContext";
import { useTranslations } from 'next-intl';

export default function LiveCameraModal({ childId, childName, onClose }) {
    const t = useTranslations('WebRTC');
    const socket = useSocket();
    const videoRef = useRef(null);
    const {
        stream,
        status,
        networkQuality,
        switchCamera,
        retryCount,
        isRetryExhausted,
        manualRetry
    } = useWebRTC(socket, childId);

    useEffect(() => {
        if (videoRef.current && stream) {
            console.log("[LiveCameraModal] Attaching stream to video element", stream);
            videoRef.current.srcObject = stream;

            videoRef.current.onloadedmetadata = () => {
                console.log("[LiveCameraModal] Video metadata loaded, playing...");
                videoRef.current.play().catch(e => console.error("Video play error (metadata):", e));
            };

            videoRef.current.play().catch(e => console.error("Video play error (immediate):", e));
        }
    }, [stream]);

    const getStatusText = () => {
        switch (status) {
            case 'connecting':
                return t('connecting');
            case 'connected':
                return t('connected');
            case 'reconnecting':
                return t('reconnecting');
            case 'retrying':
                return t('retrying', { count: retryCount });
            case 'disconnected':
                return t('offline');
            case 'rejected':
                return t('rejected');
            default:
                return status;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'connected': return 'text-emerald-400';
            case 'disconnected':
            case 'rejected':
                return 'text-red-400';
            default: return 'text-amber-400';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col pt-10 px-4 pb-20 md:p-10 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center text-white mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Camera className="text-emerald-500 animate-pulse" /> Live View: {childName}
                    </h2>
                    <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                        Status:{" "}
                        <span className={getStatusColor()}>
                            {getStatusText()}
                        </span>
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition"
                    title="Close"
                >
                    <XCircle className="w-8 h-8 text-slate-300" />
                </button>
            </div>

            {/* Video Container */}
            <div className="flex-1 bg-black rounded-2xl overflow-hidden relative border border-slate-800 shadow-2xl flex items-center justify-center">
                {status !== "connected" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10 text-white p-6 text-center">
                        {(status === "disconnected" || status === "rejected") ? (
                            <>
                                <XCircle className="w-12 h-12 text-red-500 mb-4" />
                                <p className="font-semibold text-lg text-red-400">
                                    {status === 'rejected' ? t('rejected') : t('failed')}
                                </p>
                                <p className="text-sm text-slate-400 mt-2 max-w-sm">
                                    {status === 'rejected'
                                        ? t('permissionDenied')
                                        : isRetryExhausted
                                            ? t('exhausted')
                                            : t('offline')
                                    }
                                </p>
                                {(isRetryExhausted || status === 'rejected') && (
                                    <button
                                        onClick={manualRetry}
                                        className="mt-6 flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold transition shadow-lg shadow-emerald-900/30"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                        {t('retryBtn')}
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="font-semibold text-lg">
                                    {status === 'retrying'
                                        ? t('retrying', { count: retryCount })
                                        : t('connecting')
                                    }
                                </p>
                            </>
                        )}
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                />

                {/* HUD Overlay */}
                {status === "connected" && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2">
                            <Wifi className="w-3 h-3 text-emerald-400" /> {networkQuality} Signal
                        </div>
                    </div>
                )}
            </div>

            {/* Controls Toolbar */}
            <div className="mt-8 flex justify-center gap-6">
                <button
                    onClick={switchCamera}
                    disabled={status !== "connected"}
                    className="flex flex-col items-center gap-2 disabled:opacity-50"
                >
                    <div className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition">
                        <RefreshCcw className="w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-bold">{t('flipCamera')}</span>
                </button>

                <button
                    onClick={onClose}
                    className="flex flex-col items-center gap-2"
                >
                    <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg shadow-red-900/50 transition">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-bold">{t('endStream')}</span>
                </button>
            </div>
        </div>
    );
}
