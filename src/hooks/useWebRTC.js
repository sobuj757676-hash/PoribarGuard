"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = [2000, 4000, 8000]; // Exponential backoff for ICE/Peer failures
const PING_BACKOFF_MS = [2000, 5000, 10000]; // Exponential backoff for initial offline pings

export function useWebRTC(socket, childId, isAudioOnly = false) {
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [networkQuality, setNetworkQuality] = useState('Good');
    const [retryCount, setRetryCount] = useState(0);
    const [isRetryExhausted, setIsRetryExhausted] = useState(false);

    const pcRef = useRef(null);
    const isMountedRef = useRef(true);
    const reconnectTimeoutRef = useRef(null);
    const retryTimeoutRef = useRef(null);
    const retryCountRef = useRef(0);

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
     * Create a fresh RTCPeerConnection with all event handlers
     */
    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                {
                    urls: 'turn:turn.fsafe.com:3478',
                    username: 'fsafe_rtc_user',
                    credential: 'fsafe_rtc_password'
                }
            ]
        });

        pc.ontrack = (event) => {
            console.log("[WebRTC] Received remote track", event.streams[0]);
            if (isMountedRef.current) {
                setStream(event.streams[0]);
                setStatus('connected');
                setRetryCount(0);
                setIsRetryExhausted(false);
                retryCountRef.current = 0;
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
                    // Transient — allow 10s grace period for network recovery (like moving WiFi to Cellular)
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
                    // ICE failed means we must restart the peer connection from scratch
                    attemptRetry();
                    break;

                case 'closed':
                    // Explicit tear down
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
     * Limited to MAX_RETRIES attempts.
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

        // Tear down old PC
        cleanupPC();

        // Wait using exponential backoff then create fresh connection
        retryTimeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            initiateCall();
        }, delay);
    }, [socket, cleanupPC, status]);

    /**
     * Initiate the call: ping child, then create offer.
     * Includes exponential backoff for offline pings.
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

                // Retry ping with backoff
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

            // Create fresh PeerConnection and start call
            const pc = createPeerConnection();

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

        // Handle signaling updates (answer + ICE candidates from child)
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
                // Don't immediately fail — let retry logic handle it
                attemptRetry();
            }
        };

        // Listen for child status updates (online/offline from heartbeat system)
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

        // Start the first call
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
    }, [childId, socket]); // Only re-run on childId or socket change

    const switchCamera = useCallback(() => {
        if (!socket) return;
        socket.emit('action', { childId, type: 'switch_camera' });
    }, [socket, childId]);

    return {
        stream,
        status,
        networkQuality,
        switchCamera,
        retryCount,
        isRetryExhausted,
        manualRetry
    };
}
