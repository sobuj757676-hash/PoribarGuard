"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = [2000, 4000, 8000];
const PING_BACKOFF_MS = [2000, 5000, 10000];

/**
 * Fetch dynamic ICE server configuration from the admin-managed TURN API.
 * Falls back to Google STUN if the fetch fails.
 */
async function fetchIceServers() {
    try {
        const res = await fetch('/api/turn-credentials');
        if (res.ok) {
            const data = await res.json();
            if (data.iceServers && data.iceServers.length > 0) {
                return data.iceServers;
            }
        }
    } catch (err) {
        console.warn("[useWebRTC] Failed to fetch ICE config, using fallback:", err.message);
    }
    // Fallback
    return [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ];
}

/**
 * Detect connection type from WebRTC stats (P2P / STUN / TURN Relay)
 */
async function detectConnectionType(pc) {
    try {
        const stats = await pc.getStats();
        for (const [, report] of stats) {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                const localId = report.localCandidateId;
                for (const [, r] of stats) {
                    if (r.id === localId) {
                        if (r.candidateType === 'relay') return 'relay';
                        if (r.candidateType === 'srflx') return 'srflx';
                        if (r.candidateType === 'host') return 'host';
                    }
                }
            }
        }
    } catch (e) {
        console.warn("[useWebRTC] Stats error:", e);
    }
    return 'unknown';
}

export function useWebRTC(socket, childId, isAudioOnly = false) {
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [networkQuality, setNetworkQuality] = useState('Good');
    const [connectionType, setConnectionType] = useState('unknown'); // 'host' | 'srflx' | 'relay' | 'unknown'
    const [retryCount, setRetryCount] = useState(0);
    const [isRetryExhausted, setIsRetryExhausted] = useState(false);

    const pcRef = useRef(null);
    const isMountedRef = useRef(true);
    const reconnectTimeoutRef = useRef(null);
    const retryTimeoutRef = useRef(null);
    const retryCountRef = useRef(0);
    const iceServersRef = useRef(null); // Cached ICE servers for this session

    /**
     * Clean up an existing PeerConnection
     */
    const cleanupPC = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        try {
            if (pcRef.current && pcRef.current.signalingState !== 'closed') {
                pcRef.current.close();
            }
        } catch (e) {
            console.warn("[useWebRTC] Error closing PC:", e);
        }
        pcRef.current = null;
    }, []);

    /**
     * Create a fresh RTCPeerConnection with dynamic ICE servers
     */
    const createPeerConnection = useCallback(async () => {
        // Fetch ICE servers (cached per session)
        if (!iceServersRef.current) {
            iceServersRef.current = await fetchIceServers();
        }

        const pc = new RTCPeerConnection({
            iceServers: iceServersRef.current
        });

        pc.ontrack = (event) => {
            console.log("[WebRTC] Received remote track", event.streams[0]);
            if (isMountedRef.current) {
                setStream(event.streams[0]);
                setStatus('connected');
                setRetryCount(0);
                setIsRetryExhausted(false);
                retryCountRef.current = 0;

                // Detect connection type after 3s (let ICE stabilize)
                setTimeout(async () => {
                    if (isMountedRef.current && pc.signalingState !== 'closed') {
                        const type = await detectConnectionType(pc);
                        setConnectionType(type);
                        console.log(`[WebRTC] Connection type: ${type}`);
                    }
                }, 3000);
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (!isMountedRef.current) return;
            const state = pc.iceConnectionState;
            console.log(`[WebRTC] ICE State: ${state}`);

            switch (state) {
                case 'connected':
                case 'completed':
                    setStatus('connected');
                    setRetryCount(0);
                    retryCountRef.current = 0;
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                        reconnectTimeoutRef.current = null;
                    }
                    break;

                case 'disconnected':
                    if (status !== 'reconnecting') setStatus('reconnecting');
                    if (!reconnectTimeoutRef.current) {
                        reconnectTimeoutRef.current = setTimeout(() => {
                            if (!isMountedRef.current) return;
                            console.warn("[WebRTC] ICE disconnected for 10s — attempting full renegotiation");
                            attemptRetry();
                        }, 10000);
                    }
                    break;

                case 'failed':
                    console.error("[WebRTC] ICE failed decisively");
                    attemptRetry();
                    break;

                case 'closed':
                    break;

                default:
                    break;
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('ice_candidate', { childId, candidate: event.candidate });
            }
        };

        pcRef.current = pc;
        return pc;
    }, [socket, childId]);

    /**
     * Attempt to retry the connection with a fresh PeerConnection.
     */
    const attemptRetry = useCallback(() => {
        if (!isMountedRef.current || !socket) return;

        const currentRetry = retryCountRef.current;
        if (currentRetry >= MAX_RETRIES) {
            console.error(`[WebRTC] All ${MAX_RETRIES} retry attempts exhausted`);
            setStatus('disconnected');
            setIsRetryExhausted(true);
            cleanupPC();
            return;
        }

        retryCountRef.current = currentRetry + 1;
        setRetryCount(retryCountRef.current);
        setStatus('retrying');

        const delay = RETRY_BACKOFF_MS[currentRetry] || 8000;
        console.log(`[WebRTC] Peer Connection failed. Retry attempt ${retryCountRef.current}/${MAX_RETRIES} in ${delay}ms`);

        cleanupPC();

        // Invalidate cached ICE servers on retry to get fresh credentials
        iceServersRef.current = null;

        retryTimeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            initiateCall();
        }, delay);
    }, [socket, cleanupPC, status]);

    /**
     * Initiate the call: ping child, then create offer.
     */
    const initiateCall = useCallback((pingRetry = 0) => {
        if (!isMountedRef.current || !socket || !childId) return;

        setStatus(retryCountRef.current > 0 ? 'retrying' : 'connecting');
        const startTime = Date.now();

        const handlePingResult = async (data) => {
            socket.off("ping_result", handlePingResult);
            if (!isMountedRef.current) return;

            if (data.status === "offline") {
                console.warn(`[WebRTC] Child offline (ping attempt ${pingRetry + 1})`);

                if (pingRetry < PING_BACKOFF_MS.length) {
                    const delay = PING_BACKOFF_MS[pingRetry];
                    console.log(`[WebRTC] Retrying ping in ${delay}ms...`);
                    retryTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current) {
                            initiateCall(pingRetry + 1);
                        }
                    }, delay);
                } else {
                    console.error("[WebRTC] Child unreachable after all ping retries");
                    setStatus('disconnected');
                    setIsRetryExhausted(true);
                }
                return;
            }

            const latency = Date.now() - startTime;
            console.log(`[WebRTC] Child responded! Latency: ${latency}ms`);

            // Create fresh PeerConnection with dynamic ICE servers
            const pc = await createPeerConnection();

            try {
                if (!isAudioOnly) {
                    pc.addTransceiver('video', { direction: 'recvonly' });
                }
                pc.addTransceiver('audio', { direction: 'recvonly' });
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                const eventName = isAudioOnly ? 'start_mic_stream' : 'start_stream';
                socket.emit(eventName, { childId, sdp: offer.sdp });
            } catch (err) {
                console.error("[WebRTC] Failed to create offer", err);
                attemptRetry();
            }
        };

        socket.on("ping_result", handlePingResult);
        socket.emit("ping_child", { childId, timestamp: startTime });
    }, [socket, childId, createPeerConnection, attemptRetry]);

    /**
     * Manual retry — called by the UI "Retry" button
     */
    const manualRetry = useCallback(() => {
        retryCountRef.current = 0;
        setRetryCount(0);
        setIsRetryExhausted(false);
        setStream(null);
        setConnectionType('unknown');
        iceServersRef.current = null; // Force re-fetch on manual retry
        cleanupPC();
        initiateCall();
    }, [cleanupPC, initiateCall]);

    /**
     * Main effect — sets up socket listeners and initiates the first call
     */
    useEffect(() => {
        if (!socket || !childId) {
            console.warn("[useWebRTC] Missing socket or childId");
            return;
        }

        isMountedRef.current = true;
        retryCountRef.current = 0;
        setRetryCount(0);
        setIsRetryExhausted(false);
        iceServersRef.current = null;

        const handleSignal = async (data) => {
            const pc = pcRef.current;
            if (!pc || pc.signalingState === 'closed') return;

            if (data.type === 'answer') {
                console.log("[WebRTC] Received answer from child");
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: data.sdp }));
                } catch (err) {
                    console.error("[WebRTC] Error setting remote description:", err);
                }
            } else if (data.type === 'ice_candidate') {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                    console.error("[WebRTC] ICE candidate error:", err);
                }
            }
        };

        const handleError = (data) => {
            console.error("[WebRTC] Signaling error:", data.message);

            if (data.code === 'PERMISSION_DENIED') {
                setStatus('rejected');
                setIsRetryExhausted(true);
                toast.error("Permission denied on the child's device.");
                cleanupPC();
                return;
            }

            if (data.code === 'CAMERA_IN_USE') {
                setStatus('rejected');
                setIsRetryExhausted(true);
                toast.error("Camera/Mic is currently in use by another app on the child's device.");
                cleanupPC();
                return;
            }

            toast.error(data.message || "Failed to negotiate stream with the device.");
            if (isMountedRef.current) {
                attemptRetry();
            }
        };

        const handleChildStatus = (data) => {
            if (data.childId === childId && data.status === 'offline') {
                console.warn("[WebRTC] Child went offline (heartbeat timeout)");
                if (isMountedRef.current && status === 'connected') {
                    toast.warning("Connection to child device lost. Attempting to reconnect...");
                    setStatus('reconnecting');
                    attemptRetry();
                } else if (isMountedRef.current) {
                    setStatus('disconnected');
                }
            }
        };

        socket.on('webrtc_signal', handleSignal);
        socket.on('webrtc_error', handleError);
        socket.on('child_status_update', handleChildStatus);

        initiateCall();

        return () => {
            isMountedRef.current = false;
            console.log("[WebRTC] Cleaning up connection...");

            socket.off('webrtc_signal', handleSignal);
            socket.off('webrtc_error', handleError);
            socket.off('child_status_update', handleChildStatus);
            socket.off('ping_result');

            cleanupPC();
            socket.emit('stop_stream', { childId });
        };
    }, [childId, socket]);

    const switchCamera = useCallback(() => {
        if (!socket) return;
        socket.emit('action', { childId, type: 'switch_camera' });
    }, [socket, childId]);

    return {
        stream,
        status,
        networkQuality,
        connectionType,
        switchCamera,
        retryCount,
        isRetryExhausted,
        manualRetry
    };
}
