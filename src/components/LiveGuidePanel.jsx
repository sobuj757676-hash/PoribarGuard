"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { getGuideForStep, SETUP_STEPS } from "@/data/setupGuides";
import {
    Smartphone, Wifi, WifiOff, CheckCircle, AlertCircle,
    Loader2, ChevronRight, Monitor, Shield
} from "lucide-react";

/**
 * LiveGuidePanel — Real-time setup progress tracker for the "Live Remote Hands" feature.
 * Listens for Socket.IO events from the Wizard/Child App and displays OEM-specific
 * instructions in both English and Bangla for the parent to guide over a phone call.
 */
export default function LiveGuidePanel({ pairingCode, onComplete, onDismiss }) {
    const socket = useSocket();
    const [session, setSession] = useState(null);
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(null);
    const [device, setDevice] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [progress, setProgress] = useState(null);
    const [error, setError] = useState(null);
    const [customGuides, setCustomGuides] = useState([]);

    // Fetch Admin Setup Guides Overrides
    useEffect(() => {
        const fetchCustomGuides = async () => {
            try {
                const res = await fetch('/api/setup-guides');
                if (res.ok) {
                    const data = await res.json();
                    setCustomGuides(data || []);
                }
            } catch (e) {
                console.error("Failed to load custom guides", e);
            }
        };
        fetchCustomGuides();
    }, []);

    // Poll for session on mount (fallback if socket events are missed)
    useEffect(() => {
        if (!pairingCode) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/setup-sessions?code=${pairingCode}`);
                if (res.ok) {
                    const data = await res.json();
                    setSession(data);
                    setDevice(data.device);
                    setCurrentStep(data.currentStep);
                    setSteps(data.steps || []);
                    setIsConnected(true);
                    clearInterval(interval);
                }
            } catch (e) { /* ignore */ }
        }, 3000);

        return () => clearInterval(interval);
    }, [pairingCode]);

    // Socket.IO listeners
    useEffect(() => {
        if (!socket) return;

        const handleSessionStarted = (data) => {
            if (data.pairingCode === pairingCode) {
                setSession(data);
                setDevice(data.device);
                setIsConnected(true);
                setCurrentStep('WIZARD_LAUNCHED');
            }
        };

        const handleStepUpdate = (data) => {
            setCurrentStep(data.step);
            if (data.progress !== undefined) setProgress(data.progress);
            if (data.error) setError(data.error);
            setSteps(prev => [...prev, {
                id: data.step,
                status: data.status,
                at: new Date().toISOString()
            }]);
        };

        const handleCompleted = (data) => {
            setCurrentStep('COMPLETED');
            if (onComplete) setTimeout(() => onComplete(data.childId), 3000);
        };

        socket.on("setup_session_started", handleSessionStarted);
        socket.on("setup_step_update", handleStepUpdate);
        socket.on("setup_completed", handleCompleted);

        return () => {
            socket.off("setup_session_started", handleSessionStarted);
            socket.off("setup_step_update", handleStepUpdate);
            socket.off("setup_completed", handleCompleted);
        };
    }, [socket, pairingCode, onComplete]);

    const resolveGuide = useCallback((stepId, dev) => {
        let baseGuide = getGuideForStep(stepId, dev);
        if (!dev || !customGuides || customGuides.length === 0) return baseGuide;

        // Filter custom overrides for this step and OEM
        const stepOverrides = customGuides.filter(g => 
            g.stepId === stepId && g.oem.toLowerCase() === dev.oem.toLowerCase()
        );
        
        // Prioritize exact skin match, otherwise fall back to OEM default
        let override = stepOverrides.find(g => g.skinName && dev.skinName && g.skinName.toLowerCase() === dev.skinName.toLowerCase());
        if (!override) override = stepOverrides.find(g => !g.skinName);

        if (override) {
            return {
                ...baseGuide,
                title: override.titleEn,
                titleBn: override.titleBn,
                instruction: override.instructionEn,
                instructionBn: override.instructionBn,
                screenshotUrl: override.screenshotUrl
            };
        }
        return baseGuide;
    }, [customGuides]);

    const guide = currentStep ? resolveGuide(currentStep, device) : null;
    const currentStepIndex = SETUP_STEPS.indexOf(currentStep);
    const totalSteps = SETUP_STEPS.length;
    const progressPercent = currentStepIndex >= 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

    // Completed state
    if (currentStep === 'COMPLETED') {
        return (
            <div style={styles.container}>
                <div style={styles.completedCard}>
                    <div style={styles.completedIcon}>🎉</div>
                    <h3 style={styles.completedTitle}>সেটআপ সম্পন্ন! (Setup Complete!)</h3>
                    <p style={styles.completedText}>The device is now fully protected and running in stealth mode.</p>
                    <div style={styles.deviceBadge}>
                        <Shield size={16} style={{ color: '#10b981' }} />
                        <span>{device?.model || 'Android Device'}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Waiting state
    if (!isConnected) {
        return (
            <div style={styles.container}>
                <div style={styles.waitingCard}>
                    <Loader2 size={32} style={{ ...styles.spinIcon, color: '#6b7280' }} />
                    <h3 style={styles.waitingTitle}>Waiting for child device...</h3>
                    <p style={styles.waitingText}>
                        অপেক্ষা করছি... যখন সন্তানের ফোনে Wizard Installer open হবে, এই স্ক্রিন স্বয়ংক্রিয়ভাবে Live Guide-এ পরিবর্তন হবে।
                    </p>
                    <div style={styles.codeBadge}>
                        <span style={styles.codeLabel}>Pairing Code:</span>
                        <span style={styles.codeValue}>{pairingCode}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Monitor size={20} style={{ color: '#10b981' }} />
                    <h3 style={styles.headerTitle}>Live Remote Hands</h3>
                </div>
                <div style={styles.connectionBadge}>
                    <Wifi size={14} />
                    <span>Connected</span>
                </div>
            </div>

            {/* Device Info */}
            {device && (
                <div style={styles.deviceCard}>
                    <Smartphone size={18} style={{ color: '#6366f1' }} />
                    <div>
                        <span style={styles.deviceModel}>{device.model}</span>
                        <span style={styles.deviceMeta}>
                            {device.oem} {device.skinName} • {device.osVersion}
                        </span>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
                </div>
                <span style={styles.progressText}>{progressPercent}% Complete</span>
            </div>

            {/* Current Step Guide */}
            {guide && (
                <div style={styles.guideCard}>
                    <div style={styles.guideHeader}>
                        <span style={styles.guideIcon}>{guide.icon}</span>
                        <div>
                            <h4 style={styles.guideTitle}>{guide.title}</h4>
                            <p style={styles.guideTitleBn}>{guide.titleBn}</p>
                        </div>
                    </div>
                    <div style={styles.guideDivider} />
                    
                    {/* English instruction */}
                    <div style={styles.instructionBlock}>
                        <span style={styles.langTag}>🇺🇸 EN</span>
                        <p style={styles.instructionText}>{guide.instruction}</p>
                    </div>
                    
                    {/* Bangla instruction */}
                    <div style={styles.instructionBlock}>
                        <span style={{ ...styles.langTag, background: '#fef3c7', color: '#92400e' }}>🇧🇩 BN</span>
                        <p style={styles.instructionTextBn}>{guide.instructionBn}</p>
                    </div>

                    {/* Screenshot Override */}
                    {guide.screenshotUrl && (
                        <div style={styles.screenshotContainer}>
                            <img src={guide.screenshotUrl} alt="Setup specific screenshot" style={styles.screenshotImg} />
                        </div>
                    )}

                    {/* Download progress */}
                    {currentStep === 'WIZARD_DOWNLOADING' && progress !== null && (
                        <div style={styles.downloadProgress}>
                            <Loader2 size={16} style={styles.spinIcon} />
                            <span>Downloading... {progress}%</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && currentStep?.includes('FAILED') && (
                        <div style={styles.errorBox}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Step Timeline */}
            <div style={styles.timelineContainer}>
                <h4 style={styles.timelineTitle}>Progress Timeline</h4>
                {SETUP_STEPS.map((stepId, i) => {
                    const isDone = currentStepIndex > i;
                    const isCurrent = currentStepIndex === i;
                    const stepGuide = resolveGuide(stepId, device);

                    return (
                        <div key={stepId} style={styles.timelineItem}>
                            <div style={{
                                ...styles.timelineDot,
                                ...(isDone ? styles.timelineDotDone : {}),
                                ...(isCurrent ? styles.timelineDotCurrent : {}),
                            }}>
                                {isDone ? <CheckCircle size={14} /> : isCurrent ? <Loader2 size={14} style={styles.spinIcon} /> : null}
                            </div>
                            <span style={{
                                ...styles.timelineLabel,
                                ...(isDone ? { color: '#10b981', textDecoration: 'line-through' } : {}),
                                ...(isCurrent ? { color: '#3b82f6', fontWeight: '600' } : {}),
                            }}>
                                {stepGuide?.icon} {stepGuide?.title || stepId}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    container: {
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        fontFamily: "'Inter', 'Noto Sans Bengali', sans-serif",
    },
    // Header
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    headerTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
    },
    connectionBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: '#dcfce7',
        color: '#15803d',
        fontSize: '12px',
        fontWeight: '600',
        padding: '4px 10px',
        borderRadius: '20px',
    },
    // Device Info
    deviceCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#f0f0ff',
        padding: '10px 14px',
        borderRadius: '12px',
        marginBottom: '16px',
    },
    deviceModel: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e1b4b',
    },
    deviceMeta: {
        display: 'block',
        fontSize: '12px',
        color: '#6366f1',
    },
    // Progress
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
    },
    progressBar: {
        flex: 1,
        height: '8px',
        background: '#e5e7eb',
        borderRadius: '99px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #10b981, #34d399)',
        borderRadius: '99px',
        transition: 'width 0.5s ease',
    },
    progressText: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        minWidth: '80px',
        textAlign: 'right',
    },
    // Guide Card
    guideCard: {
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    guideHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    guideIcon: {
        fontSize: '28px',
    },
    guideTitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
    },
    guideTitleBn: {
        fontSize: '13px',
        color: '#6b7280',
        margin: 0,
    },
    guideDivider: {
        height: '1px',
        background: '#f3f4f6',
        margin: '14px 0',
    },
    instructionBlock: {
        marginBottom: '12px',
    },
    langTag: {
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: '700',
        background: '#dbeafe',
        color: '#1e40af',
        padding: '2px 8px',
        borderRadius: '4px',
        marginBottom: '6px',
    },
    instructionText: {
        fontSize: '14px',
        color: '#374151',
        lineHeight: '1.6',
        margin: '4px 0 0 0',
    },
    instructionTextBn: {
        fontSize: '14px',
        color: '#374151',
        lineHeight: '1.8',
        margin: '4px 0 0 0',
        fontFamily: "'Noto Sans Bengali', sans-serif",
    },
    screenshotContainer: {
        marginTop: '16px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        background: '#f9fafb',
        display: 'flex',
        justifyContent: 'center',
        padding: '8px'
    },
    screenshotImg: {
        maxWidth: '100%',
        maxHeight: '320px',
        objectFit: 'contain',
        borderRadius: '8px'
    },
    downloadProgress: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#eff6ff',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#2563eb',
        fontWeight: '600',
    },
    errorBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#fef2f2',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#dc2626',
        fontWeight: '600',
        marginTop: '10px',
    },
    // Timeline
    timelineContainer: {
        background: '#f9fafb',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #e5e7eb',
    },
    timelineTitle: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginTop: 0,
        marginBottom: '12px',
    },
    timelineItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 0',
    },
    timelineDot: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: '#fff',
        fontSize: '10px',
    },
    timelineDotDone: {
        background: '#10b981',
    },
    timelineDotCurrent: {
        background: '#3b82f6',
    },
    timelineLabel: {
        fontSize: '12px',
        color: '#9ca3af',
    },
    // Spin animation
    spinIcon: {
        animation: 'spin 1.5s linear infinite',
    },
    // Waiting
    waitingCard: {
        textAlign: 'center',
        padding: '40px 20px',
        background: '#f9fafb',
        borderRadius: '16px',
        border: '1px dashed #d1d5db',
    },
    waitingTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        margin: '16px 0 8px',
    },
    waitingText: {
        fontSize: '13px',
        color: '#6b7280',
        lineHeight: '1.8',
        margin: '0 0 16px',
    },
    codeBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: '#ecfdf5',
        padding: '8px 16px',
        borderRadius: '8px',
    },
    codeLabel: {
        fontSize: '12px',
        color: '#6b7280',
    },
    codeValue: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#059669',
        letterSpacing: '0.15em',
    },
    // Completed
    completedCard: {
        textAlign: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
        borderRadius: '16px',
        border: '1px solid #bbf7d0',
    },
    completedIcon: {
        fontSize: '48px',
        marginBottom: '12px',
    },
    completedTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#065f46',
        margin: '0 0 8px',
    },
    completedText: {
        fontSize: '14px',
        color: '#047857',
        margin: '0 0 16px',
    },
    deviceBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: '#d1fae5',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#065f46',
    },
};
