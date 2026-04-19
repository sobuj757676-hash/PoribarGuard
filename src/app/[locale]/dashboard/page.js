"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
    Shield, Map, Home, User, Settings, Video, Mic, Smartphone,
    Bell, Battery, Wifi, AlertTriangle, Plus, X, PhoneCall,
    Clock, MapPin, Activity, CheckCircle, ShieldAlert, FileText,
    Lock, Unlock, LogOut, Globe, Camera, Loader2,
    Download, Trash2, CreditCard, Save, Edit3, Calendar, Mail, MessageSquare,
    Navigation, RefreshCw, MapPinOff, Moon,
    Zap, Compass, MicOff, LockKeyhole, SmartphoneNfc, LayoutGrid, Check, ExternalLink, Filter, Type
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import InstallPrompt from '@/components/InstallPrompt';
import LiveCameraModal from '@/components/LiveCameraModal';
import AmbientMicModal from '@/components/AmbientMicModal';
import LiveScreenModal from '@/components/LiveScreenModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import { useChildren, useMarkAlertsRead, useProfile, useUpdateProfile, useSubscription, useTogglePrayerLock, useToggleAppControl } from '@/hooks/useApi';

// Dynamically import LeafletMap (Leaflet requires `window` — can't SSR)
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false });

// ==========================================
// HELPERS
// ==========================================
function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function Skeleton({ className }) {
    return <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} />;
}

const ALERT_ICONS = {
    SOS: <ShieldAlert className="text-red-500" />,
    GEOFENCE_EXIT: <Map className="text-orange-500" />,
    GEOFENCE_ENTER: <MapPin className="text-green-500" />,
    APP_INSTALL: <Lock className="text-blue-500" />,
    APP_UNINSTALL: <Unlock className="text-purple-500" />,
    KEYWORD: <AlertTriangle className="text-amber-500" />,
    LOW_BATTERY: <Battery className="text-red-500" />,
    TAMPER: <ShieldAlert className="text-red-600" />,
};


// ==========================================
// MAIN PAGE
// ==========================================
export default function DashboardPage() {
    const dict = useTranslations('Dashboard');
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('home');
    const [isAddChildModalOpen, setAddChildModalOpen] = useState(false);
    const [addChildStep, setAddChildStep] = useState(1);
    const [isCameraModalOpen, setCameraModalOpen] = useState(false);
    const [isAmbientMicModalOpen, setAmbientMicModalOpen] = useState(false);
    const [isScreenModalOpen, setScreenModalOpen] = useState(false);
    const [reconnectChildId, setReconnectChildId] = useState(null);

    // Premium Feature Modal
    const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, feature: null });

    // Helper for feature checking
    const checkFeature = (feature, callback) => {
        if (!subscription) return;
        if (!subscription.active || (subscription.isExpired && subscription.isTrial)) {
            setUpgradeModal({ isOpen: true, feature });
            return;
        }
        if (subscription.features && !subscription.features.includes(feature)) {
            setUpgradeModal({ isOpen: true, feature });
            return;
        }
        callback();
    };

    // Real data state
    const [selectedChildIdx, setSelectedChildIdx] = useState(0);
    const [liveLocation, setLiveLocation] = useState(null);

    const { children, isLoading: loading, mutate: fetchChildren } = useChildren();
    const { trigger: markAlertsRead } = useMarkAlertsRead();
    const { subscription } = useSubscription();


    const userName = session?.user?.name || 'Parent';
    const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const child = children[selectedChildIdx] || null;
    const device = child?.device || null;

    useEffect(() => {
        setTimeout(() => setLiveLocation(null), 0);
    }, [selectedChildIdx]);

    // Derived Status for Global Header
    const acc = liveLocation?.accuracy || device?.locationAccuracy || 50;
    const battery = liveLocation?.batteryLevel ?? device?.batteryLevel;
    const network = liveLocation?.networkType || device?.networkType;
    const lastUpdated = liveLocation?.timestamp ? new Date(liveLocation.timestamp) : (device?.locationUpdatedAt ? new Date(device.locationUpdatedAt) : null);

    const planLabel = subscription ? (subscription.isTrial ? 'Free Trial' : `${subscription.planName} Plan`) : 'No Plan';
    const endDate = subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    // Socket.IO real-time listeners (Task 3: SOS + Task 9: Status Updates)
    const socket = useSocket();
    const lastStatusRefresh = useRef(0);
    useEffect(() => {
        if (!socket) return;

        // SOS Alert listener — show emergency notification
        const handleSOS = (data) => {
            const sosChild = children.find(c => c.id === data.childId);
            const name = sosChild?.name || 'Child';
            toast.error(`🚨 SOS EMERGENCY from ${name}!`, {
                description: `Location: ${data.latitude?.toFixed(4)}, ${data.longitude?.toFixed(4)} | Battery: ${data.batteryLevel}%`,
                duration: 30000, // Keep visible for 30 seconds
                important: true,
            });
            // Play alert sound
            try {
                const audio = new Audio('/alert.mp3');
                audio.volume = 1.0;
                audio.play().catch(() => { });
            } catch (e) { }
            // Refresh data to show the new alert in feed
            fetchChildren();
        };

        // Child status update (battery/network from heartbeat)
        // Throttled to max 1 refresh every 60 seconds to prevent API spam
        const handleStatusUpdate = (data) => {
            const now = Date.now();
            if (now - lastStatusRefresh.current > 60000) {
                lastStatusRefresh.current = now;
                fetchChildren();
            }
        };

        const handleLocationUpdate = (data) => {
            if (child?.id && data.childId === child.id) {
                setLiveLocation(data);
            }
        };

        socket.on('sos_alert', handleSOS);
        socket.on('child_status_update', handleStatusUpdate);
        socket.on('location_update', handleLocationUpdate);

        return () => {
            socket.off('sos_alert', handleSOS);
            socket.off('child_status_update', handleStatusUpdate);
            socket.off('location_update', handleLocationUpdate);
        };
    }, [socket, child?.id]);

    // When children list changes structurally, subscribe socket to their rooms
    // Using children.length to avoid re-running on every data refresh
    const childCount = children?.length || 0;
    useEffect(() => {
        if (!socket || !childCount) return;
        const childIds = children.map(c => c.id);
        socket.emit('subscribe_children', { childIds });
    }, [socket, childCount]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
            <InstallPrompt />

            {/* --- TOP BAR --- */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 shadow-sm z-50 flex items-center justify-between px-4 md:pl-72">
                <div className="flex items-center gap-3">
                    <div className="md:hidden bg-emerald-600 p-2 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{dict.greeting},</h1>
                        <h2 className="text-lg font-bold leading-tight">{userName}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <div className="relative cursor-pointer" onClick={async () => {
                        if (child?.id && child.alerts?.some(a => !a.isRead)) {
                            try {
                                await markAlertsRead({ body: { childId: child.id } });
                                fetchChildren();
                            } catch {
                                toast.error(dict('networkError') || 'Failed to mark alerts as read');
                            }
                        }
                    }}>
                        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        {child?.alerts?.some(a => !a.isRead) && (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
                        )}
                    </div>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-emerald-200 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {initials}
                    </button>
                </div>
            </header>

            {/* --- SIDEBAR (Desktop) --- */}
            <aside className="hidden md:flex flex-col w-64 fixed top-0 left-0 bottom-0 bg-white dark:bg-gray-900 shadow-lg z-50 pt-6">
                <div className="flex items-center gap-3 px-6 mb-8">
                    <div className="bg-emerald-600 p-2 rounded-xl shadow-emerald-500/30 shadow-lg">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">PoribarGuard</h1>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">BD EDITION</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    <SidebarItem icon={<Home />} label={dict('home')} isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <SidebarItem icon={<Map />} label={dict('map')} isActive={activeTab === 'map'} onClick={() => setActiveTab('map')} />
                    <SidebarItem icon={<Lock />} label={dict('controls')} isActive={activeTab === 'controls'} onClick={() => setActiveTab('controls')} />
                    <SidebarItem icon={<Video />} label={dict('tools')} isActive={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
                    <SidebarItem icon={<MessageSquare />} label={dict('messages') || 'Messages'} isActive={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                    <SidebarItem icon={<Activity />} label={dict('feed')} isActive={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
                    <SidebarItem icon={<FileText />} label={dict('reports')} isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                    <SidebarItem icon={<Settings />} label={dict('settings')} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <button onClick={() => setAddChildModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                        <Plus className="w-5 h-5" /> {dict('addChild')}
                    </button>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center justify-center gap-2 text-red-500 p-2 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="pt-20 pb-36 md:pb-6 md:pl-64 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 md:px-8">

                    {/* Child Selector */}
                    {loading ? (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm mb-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div><Skeleton className="h-5 w-32 mb-1" /><Skeleton className="h-3 w-48" /></div>
                            </div>
                        </div>
                    ) : children.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
                            <Shield className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                            <h2 className="text-xl font-bold text-gray-500">{dict('noChildren')}</h2>
                            <p className="text-gray-400 text-sm mt-2 mb-4">{dict('addFirstChild')}</p>
                            <button onClick={() => setAddChildModalOpen(true)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition">
                                <Plus className="w-4 h-4 inline mr-2" />{dict('addChild')}
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Premium Upgrade Modal */}
                            {upgradeModal.isOpen && (
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden border border-gray-100 dark:border-gray-800 scale-in-center">
                                        <div className="absolute top-0 right-0 p-4">
                                            <button onClick={() => setUpgradeModal({ isOpen: false, feature: null })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
                                                <Lock className="w-8 h-8" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">Premium Feature</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                                            {subscription?.isTrial && subscription?.isExpired
                                                ? "Your free trial has ended. Please upgrade your plan to continue using this feature."
                                                : "This feature is not included in your current active plan. Please upgrade to a premium plan to unlock it."}
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <button onClick={() => { setUpgradeModal({ isOpen: false, feature: null }); setActiveTab('settings'); }} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                                                <Zap className="w-5 h-5" /> Upgrade Plan
                                            </button>
                                            <button onClick={() => setUpgradeModal({ isOpen: false, feature: null })} className="w-full py-3 font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                                Not Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Subscription Status Header */}
                            {subscription && (
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-3 shadow-md mb-6 flex justify-between items-center text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Shield className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-100 font-medium">Active Plan</p>
                                            <p className="font-bold">{planLabel}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-emerald-100 font-medium">Expires</p>
                                        <p className="font-bold">{endDate}</p>
                                    </div>
                                </div>
                            )}

                            {/* Child ribbon with selector */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between bg-white dark:bg-gray-900 rounded-[2rem] p-2.5 shadow-md mb-6 border border-gray-200 dark:border-gray-800/60 overflow-hidden">
                                <div className="flex items-center gap-4 pl-1 min-w-0">
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 rounded-full bg-[#10b981] flex items-center justify-center text-white font-black text-2xl shadow-inner">
                                            {child?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-4 h-4 ${device?.isOnline ? 'bg-[#10b981]' : 'bg-gray-500'} border-[3px] border-white dark:border-gray-900 rounded-full`}></div>
                                    </div>
                                    <div className="flex flex-col truncate pr-2">
                                        {children.length > 1 ? (
                                            <select value={selectedChildIdx} onChange={(e) => setSelectedChildIdx(Number(e.target.value))} className="font-bold text-xl text-gray-900 dark:text-white bg-transparent outline-none cursor-pointer tracking-tight">
                                                {children.map((c, i) => (
                                                    <option key={c.id} value={i} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{c.name} ({c.age})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white tracking-tight truncate flex items-baseline gap-1.5">
                                                {child?.name} <span className="text-gray-500 dark:text-gray-400 text-base font-medium">({child?.age})</span>
                                            </h3>
                                        )}
                                        <p className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 tracking-wide ${device?.isOnline ? 'text-[#10b981]' : 'text-gray-400'}`}>
                                            <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                                            {device?.isOnline ? 'LIVE' : 'OFFLINE'}
                                        </p>
                                        {!device?.isOnline && child?.id && (
                                            <button
                                                onClick={() => { setReconnectChildId(child.id); setAddChildModalOpen(true); }}
                                                className="mt-1 text-xs text-blue-400 hover:text-blue-300 font-bold hover:underline text-left">
                                                {dict('reconnect')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Global Device Status Indicator Pill */}
                                <div className="flex items-center gap-3.5 bg-gray-100 dark:bg-gray-950/80 rounded-[1.5rem] px-5 py-2.5 border border-gray-200 dark:border-gray-800 shrink-0 mt-3 sm:mt-0 mr-1 w-full sm:w-auto justify-center sm:justify-start">
                                    <div className="flex items-center gap-2">
                                        <Battery className={`w-5 h-5 ${(battery || 0) > 20 ? 'text-emerald-500' : (battery || 0) > 10 ? 'text-amber-500' : 'text-[#f43f5e]'}`} />
                                        <span className={`text-base font-bold ${(battery || 0) > 20 ? 'text-emerald-600 dark:text-emerald-400' : (battery || 0) > 10 ? 'text-amber-600 dark:text-amber-400' : 'text-[#f43f5e]'}`}>{battery ?? '—'}%</span>
                                    </div>

                                    <span className="text-gray-300 dark:text-gray-700 font-light">|</span>

                                    <Wifi className="w-5 h-5 text-blue-500" />

                                    <span className="text-gray-300 dark:text-gray-700 font-light">|</span>

                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                                        <span className="text-base font-bold text-gray-900 dark:text-white">±{Math.round(acc)}m</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            {activeTab === 'home' && <HomeTab dict={dict} child={child} device={device} fetchChildren={fetchChildren} onOpenCamera={() => checkFeature('location_tracking', () => setCameraModalOpen(true))} onOpenScreen={() => checkFeature('location_tracking', () => setScreenModalOpen(true))} checkFeature={checkFeature} />}
                            {activeTab === 'map' && <MapTab dict={dict} child={child} device={device} liveLocation={liveLocation} checkFeature={checkFeature} />}
                            {activeTab === 'controls' && <ControlsTab dict={dict} child={child} checkFeature={checkFeature} />}
                            {activeTab === 'messages' && <MessagesTab dict={dict} child={child} socket={socket} checkFeature={checkFeature} />}
                            {activeTab === 'tools' && <LiveToolsTab dict={dict} onOpenCamera={() => checkFeature('location_tracking', () => setCameraModalOpen(true))} onOpenMic={() => checkFeature('location_tracking', () => setAmbientMicModalOpen(true))} onOpenScreen={() => checkFeature('location_tracking', () => setScreenModalOpen(true))} checkFeature={checkFeature} />}
                            {activeTab === 'feed' && <FeedTab dict={dict} child={child} checkFeature={checkFeature} />}
                            {activeTab === 'reports' && <ReportsTab dict={dict} child={child} checkFeature={checkFeature} />}
                            {activeTab === 'settings' && <SettingsTab dict={dict} session={session} />}
                        </>
                    )}
                </div>
            </main>

            {/* --- BOTTOM NAV (Mobile) --- */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 dark:border-gray-800 z-50 px-2 py-2 pb-safe flex justify-between items-center">
                <BottomNavItem icon={<Home />} label={dict('home')} isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <BottomNavItem icon={<MessageSquare />} label={dict('messages') || 'Messages'} isActive={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                <div className="relative -top-5 px-1 flex justify-center">
                    {child?.id && (
                        <button onClick={() => setActiveTab('tools')} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 transition-transform active:scale-95 ${activeTab === 'tools' ? 'bg-red-600' : 'bg-red-500'} border-4 border-white dark:border-gray-900`}>
                            <Video className="w-6 h-6 text-white" />
                        </button>
                    )}
                </div>
                <BottomNavItem icon={<Lock />} label={dict('controls')} isActive={activeTab === 'controls'} onClick={() => setActiveTab('controls')} />
                <BottomNavItem icon={<Activity />} label={dict('feed')} isActive={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
            </nav>

            {/* --- ADD CHILD/RECONNECT MODAL --- */}
            {isAddChildModalOpen && (
                <AddChildWorkflow dict={dict} step={addChildStep} setStep={setAddChildStep} reconnectChildId={reconnectChildId} onClose={() => { setAddChildModalOpen(false); setAddChildStep(1); setReconnectChildId(null); }} onChildAdded={fetchChildren} />
            )}

            {/* --- WEBRTC LIVE CAMERA MODAL --- */}
            {isCameraModalOpen && child?.id && (
                <LiveCameraModal childId={child.id} childName={child.name} onClose={() => setCameraModalOpen(false)} />
            )}

            {/* --- AMBIENT MIC MODAL --- */}
            {isAmbientMicModalOpen && child?.id && (
                <AmbientMicModal childId={child.id} childName={child.name} onClose={() => setAmbientMicModalOpen(false)} />
            )}

            {/* --- LIVE SCREEN VIEW MODAL --- */}
            {isScreenModalOpen && child?.id && (
                <LiveScreenModal childId={child.id} childName={child.name} onClose={() => setScreenModalOpen(false)} />
            )}
        </div>
    );
}


// ==========================================
// HOME TAB (Real Data)
// ==========================================
function HomeTab({ dict, child, device, fetchChildren, onOpenCamera, onOpenScreen }) {
    const sendAlarm = async () => {
        if (!child?.id) return;

        try {
            const res = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ childId: child.id, type: 'SOS', title: 'SOS Alarm Triggered by Parent', description: 'Parent manually triggered emergency alarm.' }),
            });

            if (!res.ok) throw new Error('Failed to send alarm');

            fetchChildren?.();
            toast.success('🚨 SOS Alarm sent to child&apos;s device!');
        } catch {
            toast.error('Network error. Failed to send alarm.');
        }
    };

    const comingSoon = () => toast.info('⏳ This feature requires the child&apos;s Android app to be connected.');
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{dict('quickActions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <ActionButton icon={<Smartphone className="w-7 h-7" />} label={dict('reqScreen')} color="bg-blue-500" shadow="shadow-blue-500/20" onClick={onOpenScreen} />
                    <ActionButton icon={<Camera className="w-7 h-7" />} label={dict('reqCamera')} color="bg-emerald-500" shadow="shadow-emerald-500/20" onClick={onOpenCamera} />
                    <ActionButton icon={<Mic className="w-7 h-7" />} label={dict('reqMic')} color="bg-purple-500" shadow="shadow-purple-500/20" onClick={comingSoon} />
                    <ActionButton icon={<Bell className="w-7 h-7" />} label={dict('sendAlarm')} color="bg-red-500" shadow="shadow-red-500/30" pulse onClick={sendAlarm} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Live Location */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-500" /> {dict('liveLocation')}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${device?.isOnline ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{device?.isOnline ? dict('live') : dict('lastKnown')}</span>
                    </div>
                    <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-30 dark:opacity-10"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full animate-ping absolute -inset-2"></div>
                            <MapPin className="w-8 h-8 text-emerald-600 relative z-10 drop-shadow-md" />
                        </div>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{device?.locationName || 'Location unavailable'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{device?.speed ? `Moving • ${device.speed} km/h` : dict('accuracy')}</p>
                </div>

                {/* Today's Summary */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-blue-500" /> {dict('todaySummary')}</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{dict('screenTime')}</p>
                                    <p className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                                        {child?.appControls ? `${Math.floor(child.appControls.reduce((sum, a) => sum + a.usageToday, 0) / 60)}h ${child.appControls.reduce((sum, a) => sum + a.usageToday, 0) % 60}m` : '0h 0m'}
                                    </p>
                                </div>
                            </div>

                            {/* Recharts Donut Chart */}
                            {child?.appControls && child.appControls.length > 0 ? (
                                <div className="h-40 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={child.appControls
                                                    .sort((a, b) => b.usageToday - a.usageToday)
                                                    .slice(0, 4)
                                                    .map((a, i, arr) => {
                                                        if (i === 3) return { name: 'Other', value: arr.slice(3).reduce((sum, a) => sum + a.usageToday, 0), fill: '#9ca3af' };
                                                        return { name: a.appName, value: a.usageToday, fill: a.iconColor || ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][i % 4] };
                                                    }).filter(d => d.value > 0)}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={65}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {child.appControls.slice(0, 4).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(value) => `${Math.floor(value / 60)}h ${value % 60}m`}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No usage data today</div>
                            )}
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{dict('geofence')}</p>
                                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> {child?.geofences?.length || 0} {dict('zonesActive')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Alerts */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{dict('recentAlerts')}</h3>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {(!child?.alerts || child.alerts.length === 0) ? (
                        <p className="text-sm text-gray-400 p-6 text-center">{dict('noRecentAlerts')}</p>
                    ) : (
                        child.alerts.map(a => (
                            <AlertRow key={a.id} icon={ALERT_ICONS[a.type] || <Bell className="text-gray-500" />} title={a.title} time={timeAgo(a.createdAt)} isRed={a.severity === 'CRITICAL' || a.severity === 'HIGH'} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}


// ==========================================
// MAP TAB (Real-Time Leaflet Map + Socket.IO)
// ==========================================
function MapTab({ dict, child, device, liveLocation }) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleForceRefresh = () => {
        setIsRefreshing(true);
        // Simulate a refresh delay, this could also emit a socket event if the backend supports forcing an update
        setTimeout(() => setIsRefreshing(false), 2000);
    };

    // Use live data if available, otherwise fall back to database device data
    const lat = liveLocation?.latitude || device?.latitude || 23.1634;
    const lng = liveLocation?.longitude || device?.longitude || 89.2182;
    const acc = liveLocation?.accuracy || device?.locationAccuracy || 50;
    const spd = liveLocation?.speed || device?.speed || 0;
    const locName = liveLocation?.locationName || device?.locationName || '';
    const battery = liveLocation?.batteryLevel ?? device?.batteryLevel;
    const network = liveLocation?.networkType || device?.networkType;
    const hasRealLocation = !!(liveLocation?.latitude || device?.latitude);
    const lastUpdated = liveLocation?.timestamp ? new Date(liveLocation.timestamp) : (device?.locationUpdatedAt ? new Date(device.locationUpdatedAt) : null);

    return (
        <div className="h-[calc(100vh-10rem)] w-full relative -mx-4 md:-mx-8 md:rounded-2xl md:overflow-hidden md:border-2 md:border-gray-200 dark:md:border-gray-800 shadow-md animate-in fade-in duration-300">

            {/* Leaflet Map */}
            {hasRealLocation ? (
                <div className={`w-full h-full ${!device?.isOnline ? 'grayscale opacity-75' : ''}`}>
                    <LeafletMap
                        latitude={lat}
                        longitude={lng}
                        accuracy={acc}
                        speed={spd}
                        locationName={locName}
                        isOnline={device?.isOnline}
                        childName={child?.name || 'Child'}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
                    <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-emerald-500/40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute inset-0 rounded-full bg-emerald-500/10"></div>
                        <div className="absolute w-1/2 h-1/2 top-0 right-0 bg-gradient-to-bl from-emerald-500/50 to-transparent origin-bottom-left animate-spin" style={{ animationDuration: '3s' }}></div>
                        <MapPin className="w-10 h-10 text-emerald-500 relative z-10 drop-shadow-lg" />
                    </div>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg flex items-center gap-2">
                        {dict('searching')}
                        <span className="flex gap-0.5">
                            <span className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </span>
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{dict('waitingLocationDesc')}</p>
                </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl rounded-full p-2 z-[1000] border border-white/20">
                <button
                    onClick={handleForceRefresh}
                    className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 transition shadow-sm"
                    title={dict('forceRefresh')}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition shadow-sm" title={dict('viewHistory')}>
                    <Clock className="w-5 h-5" />
                </button>
                <button className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition shadow-sm" title={dict('setGeofence')}>
                    <MapPinOff className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}


// ==========================================
// CONTROLS TAB (Real Data)
// ==========================================
function ControlsTab({ dict, child }) {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                    <Moon className="w-5 h-5 text-indigo-500" /> {dict('prayerTimes')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Automatically locks device during selected prayer times (BD Time).</p>
                <div className="space-y-3">
                    {(!child?.prayerLocks || child.prayerLocks.length === 0) ? (
                        <p className="text-sm text-gray-400 text-center py-4">No prayer time locks configured</p>
                    ) : (
                        child.prayerLocks.map(pl => (
                            <ToggleRow key={pl.id} label={`${pl.name} (${pl.startTime} - ${pl.endTime})`} defaultChecked={pl.isActive} childId={child.id} prayerLockId={pl.id} />
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                    <Smartphone className="w-5 h-5 text-red-500" /> {dict('appLimits')}
                </h3>
                <div className="space-y-4">
                    {(!child?.appControls || child.appControls.length === 0) ? (
                        <p className="text-sm text-gray-400 text-center py-4">No app controls configured</p>
                    ) : (
                        child.appControls.map(ac => (
                            <AppControlRow key={ac.id} id={ac.id} childId={child.id} name={ac.appName} time={`${Math.floor((ac.usageToday || 0) / 60)}h ${(ac.usageToday || 0) % 60}m today`} isBlocked={ac.isBlocked} iconColor={ac.iconColor || 'bg-gray-500'} iconUrl={ac.iconUrl} usageToday={ac.usageToday} dailyLimit={ac.dailyLimit} dict={dict} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}


// ==========================================
// LIVE TOOLS TAB (Unchanged)
// ==========================================
function LiveToolsTab({ dict, onOpenCamera, onOpenMic, onOpenScreen }) {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><ShieldAlert className="w-8 h-8" /> Live Operations</h2>
                <p className="text-red-100 opacity-90 text-sm mb-6">{dict('liveToolsDesc')}</p>
                <div className="grid grid-cols-1 gap-4">
                    <button onClick={onOpenScreen} className="flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl transition-all group">
                        <div className="flex items-center gap-4"><div className="bg-white p-3 rounded-full text-red-600 group-hover:scale-110 transition-transform"><Video className="w-6 h-6" /></div><div className="text-left"><h4 className="font-bold text-lg">Live Screen View</h4><p className="text-xs text-red-100">Watch child&apos;s screen in 1080p</p></div></div>
                        <span className="bg-red-700 px-3 py-1 rounded-full text-xs font-bold">START</span>
                    </button>
                    <button onClick={onOpenCamera} className="flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl transition-all group">
                        <div className="flex items-center gap-4"><div className="bg-white p-3 rounded-full text-red-600 group-hover:scale-110 transition-transform"><Camera className="w-6 h-6" /></div><div className="text-left"><h4 className="font-bold text-lg">Remote Camera</h4><p className="text-xs text-red-100">Front/Back camera access</p></div></div>
                        <span className="bg-red-700 px-3 py-1 rounded-full text-xs font-bold">START</span>
                    </button>
                    <button onClick={onOpenMic} className="flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl transition-all group">
                        <div className="flex items-center gap-4"><div className="bg-white p-3 rounded-full text-red-600 group-hover:scale-110 transition-transform"><Mic className="w-6 h-6" /></div><div className="text-left"><h4 className="font-bold text-lg">Ambient Mic Listen</h4><p className="text-xs text-red-100">Listen to surroundings</p></div></div>
                        <span className="bg-red-700 px-3 py-1 rounded-full text-xs font-bold">START</span>
                    </button>
                </div>
            </div>
        </div>
    );
}


// ==========================================
// ADD CHILD WORKFLOW (Real API)
// ==========================================
function AddChildWorkflow({ dict, step, setStep, onClose, onChildAdded, reconnectChildId }) {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [pairingCode, setPairingCode] = useState('');
    const [childId, setChildId] = useState(reconnectChildId || '');

    // Auto-generate pairing code if we are in reconnect mode
    useEffect(() => {
        if (reconnectChildId && step === 1) {
            setStep(2); // Skip Step 1
            const generateReconnectCode = async () => {
                setSaving(true);
                try {
                    const res = await fetch(`/api/children/${reconnectChildId}/pair`, { method: 'POST' });
                    const data = await res.json();
                    if (res.ok) {
                        setPairingCode(data.pairingCode);
                    } else {
                        setError(data.error || 'Failed to generate code');
                    }
                } catch { setError('Network error'); }
                setSaving(false);
            };
            generateReconnectCode();
        }
    }, [reconnectChildId, step, setStep]);

    const handleCreateChild = async () => {
        if (!name || !age) { setError('Name and age are required'); return; }
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/children', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, age: parseInt(age), phone: phone ? `+880${phone}` : '' }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to add child'); setSaving(false); return; }
            setPairingCode(data.pairingCode);
            setChildId(data.id);
            setSaving(false);
            setStep(2);
        } catch { setError('Network error'); setSaving(false); }
    };

    // Polling effect for pairing status
    useEffect(() => {
        if (step !== 2 || !childId) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/children/${childId}/status`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.isPaired) {
                        clearInterval(interval);
                        setStep(3);
                        onChildAdded?.();
                    }
                }
            } catch (err) {
                console.error("Failed to poll status", err);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [step, childId]);

    const copyCode = () => {
        navigator.clipboard.writeText(pairingCode);
        toast.success('Code copied to clipboard!');
    };

    const magicLinkUrl = `https://fsafe.com/invite/${pairingCode}`;

    const sendWhatsApp = () => {
        const text = encodeURIComponent(`Install PoribarGuard to connect with me. Click here: ${magicLinkUrl} (Code: ${pairingCode})`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-bold text-lg">{reconnectChildId ? "Reconnect Device" : dict('addChild')}</h2>
                    <button onClick={onClose} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"><X className="w-4 h-4" /></button>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5">
                    <div className="bg-emerald-500 h-1.5 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">{dict('addWorkflowStep1')}</h3>
                            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{dict('name')}</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ayaan" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{dict('age')}</label>
                                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 12" min="3" max="18" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{dict('phone')}</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold">+880</span>
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="17XX XXXXXX" className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-5 text-center">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Pairing Code Generated</h3>
                            <p className="text-sm text-gray-500">Enter this code in the child&apos;s app to pair the device instantly.</p>

                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 border-dashed rounded-2xl py-6 flex flex-col items-center justify-center relative group cursor-pointer" onClick={copyCode}>
                                <div className="text-4xl font-black text-emerald-600 tracking-[0.2em]">{pairingCode}</div>
                                <div className="absolute top-2 right-2 p-1.5 bg-emerald-100 dark:bg-emerald-800 opacity-0 group-hover:opacity-100 transition rounded-lg text-emerald-700">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <p className="text-xs text-emerald-600 font-medium mt-2">Tap to copy code</p>
                            </div>

                            <button onClick={sendWhatsApp} className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white p-3.5 rounded-xl font-bold hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/30">
                                Send Magic Link via WhatsApp
                            </button>

                            <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="font-medium">Waiting for child to connect...</span>
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="py-8 flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle className="w-12 h-12 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl mb-1">Device Connected!</h3>
                                <p className="text-base text-gray-500">{name}&apos;s phone is now secured and active.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                    {step === 1 && (
                        <>
                            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">{dict('cancel')}</button>
                            <button onClick={handleCreateChild} disabled={saving} className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30 disabled:opacity-50">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : dict('next')}
                            </button>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">Cancel</button>
                        </>
                    )}
                    {step === 3 && (
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30 w-full text-lg">Go to Dashboard</button>
                    )}
                </div>
            </div>
        </div>
    );
}


// ==========================================
// FEED TAB (Live Alerts Timeline)
// ==========================================
function FeedTab({ dict, child }) {
    const alerts = child?.alerts || [];

    const typeIcon = (type) => {
        if (type === 'SOS') return <AlertTriangle className="w-4 h-4 text-red-500" />;
        if (type === 'GEOFENCE_EXIT') return <MapPin className="w-4 h-4 text-orange-500" />;
        if (type === 'APP_INSTALL') return <Smartphone className="w-4 h-4 text-blue-500" />;
        if (type === 'LOW_BATTERY') return <Battery className="w-4 h-4 text-amber-500" />;
        return <Bell className="w-4 h-4 text-gray-500" />;
    };

    const timeAgo = (date) => {
        const s = Math.floor((new Date().getTime() - new Date(date)) / 1000);
        if (s < 60) return 'just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-bold">Activity Feed</h2>
                    <p className="text-sm text-gray-500">Live monitoring stream for {child?.name || 'child'}&apos;s device.</p>
                </div>
            </div>

            {alerts.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-bold">No activity yet</p>
                    <p className="text-sm mt-1">Alerts and activity from {child?.name || 'child'}&apos;s device will appear here</p>
                </div>
            ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-800 before:to-transparent">
                    {alerts.map((item, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-950 bg-gray-100 dark:bg-gray-800 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                {typeIcon(item.type)}
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.type === 'SOS' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>{item.type?.replace(/_/g, ' ') || 'ALERT'}</span>
                                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(item.createdAt)}</span>
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">{item.title}</h4>
                                {item.description && <p className={`text-sm ${item.type === 'SOS' ? 'text-red-500 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>{item.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==========================================
// REPORTS TAB (Live Data)
// ==========================================
function ReportsTab({ dict, child }) {
    const alerts = child?.alerts || [];

    // Group alerts into weekly buckets
    const [now, setNow] = useState(null);
    useEffect(() => { setTimeout(() => setNow(Date.now()), 0); }, []);
    if (!now) return null;

    const weeks = [0, 1, 2, 3].map(i => {
        const start = new Date(now - (i + 1) * 7 * 86400000);
        const end = new Date(now - i * 7 * 86400000);
        const weekAlerts = alerts.filter(a => {
            const d = new Date(a.createdAt);
            return d >= start && d < end;
        });
        return { weekNum: i + 1, start, end, alerts: weekAlerts };
    });

    const downloadCSV = (week) => {
        const header = 'Date,Type,Title,Description,Read';
        const rows = week.alerts.map(a =>
            `"${new Date(a.createdAt).toLocaleString()}","${a.type}","${a.title}","${a.description || ''}","${a.isRead ? 'Yes' : 'No'}"`
        ).join('\n');
        const csv = header + '\n' + (rows || 'No alerts this week');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${child?.name || 'child'}_week${week.weekNum}_report.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">Generated Reports</h2>
                    <p className="text-sm text-gray-500">Weekly activity summaries of {child?.name || 'child'}&apos;s device activity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {weeks.map(w => (
                    <div key={w.weekNum} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm group hover:border-emerald-500/50 transition duration-300">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {w.weekNum === 1 ? 'This Week' : `${w.weekNum} Weeks Ago`}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {w.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                            {w.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400 mb-4">{w.alerts.length} alert{w.alerts.length !== 1 ? 's' : ''} this period</p>
                        <button onClick={() => downloadCSV(w)} className="w-full flex justify-center items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-200 dark:border-gray-700 py-2 rounded-lg text-sm font-bold transition">
                            <Download className="w-4 h-4" /> Download CSV
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// SETTINGS TAB (Live API)
// ==========================================
function SettingsTab({ dict, session }) {
    const { user } = useProfile();
    const { subscription } = useSubscription();
    const { trigger: updateProfile } = useUpdateProfile();

    const [profile, setProfile] = useState({ name: session?.user?.name || '', phone: '', country: '', city: '' });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    // Sync profile state when SWR data loads
    useEffect(() => {
        if (user) {
            setTimeout(() => setProfile(prev => ({
                ...prev,
                name: user.name || prev.name,
                phone: user.phone || '',
                country: user.country || '',
                city: user.city || ''
            })), 0);
        }
    }, [user]);

    const saveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile({ method: 'PUT', body: { name: profile.name, phone: profile.phone, country: profile.country, city: profile.city } });
            toast.success(dict('saved') || 'Profile updated successfully');
        } catch (e) {
            toast.error(e.message || 'Failed to update profile');
        }
        setSaving(false);
    };

    const COUNTRIES = [
        { value: "UAE", label: "🇦🇪 United Arab Emirates" },
        { value: "KSA", label: "🇸🇦 Saudi Arabia" },
        { value: "UK", label: "🇬🇧 United Kingdom" },
        { value: "USA", label: "🇺🇸 United States" },
        { value: "Malaysia", label: "🇲🇾 Malaysia" },
        { value: "Singapore", label: "🇸🇬 Singapore" },
        { value: "Qatar", label: "🇶🇦 Qatar" },
        { value: "Kuwait", label: "🇰🇼 Kuwait" },
        { value: "Oman", label: "🇴🇲 Oman" },
        { value: "Bahrain", label: "🇧🇭 Bahrain" },
        { value: "Italy", label: "🇮🇹 Italy" },
        { value: "Bangladesh", label: "🇧🇩 Bangladesh" },
        { value: "Other", label: "🌍 Other" },
    ];

    const planLabel = subscription ? (subscription.isTrial ? 'Free Trial' : `${subscription.planName} Plan`) : 'No Plan';
    const statusLabel = subscription?.active ? 'ACTIVE' : (subscription?.isExpired ? 'EXPIRED' : 'INACTIVE');
    const endDate = subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    const handleCheckout = async (gateway) => {
        setSaving(true);
        try {
            const res = await fetch('/api/subscriptions/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gateway, plan: 'PREMIUM' })
            });
            const data = await res.json();
            if (res.ok && data.checkoutUrl) {
                toast.success(data.message || 'Redirecting to payment gateway...');
                setTimeout(() => window.location.href = data.checkoutUrl, 1000);
            } else {
                toast.error(data.error || 'Checkout failed');
            }
        } catch (e) {
            toast.error('Network error during checkout');
        }
        setSaving(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl">
            <h2 className="text-xl font-bold mb-6">Account Settings</h2>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-2xl flex items-center justify-center border-4 border-emerald-100 dark:border-emerald-900/50">
                        {profile.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{profile.name || 'Parent Member'}</h3>
                        <p className="text-sm text-gray-500">{session?.user?.email || 'parent@example.com'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                        <input type="text" value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full sm:w-2/3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-gray-800 dark:text-gray-200" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                        <input type="tel" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+8801700000000" className="w-full sm:w-2/3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-gray-800 dark:text-gray-200" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Country</label>
                        <select
                            value={profile.country}
                            onChange={(e) => setProfile(p => ({ ...p, country: e.target.value }))}
                            className="w-full sm:w-2/3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-gray-800 dark:text-gray-200 appearance-none"
                        >
                            <option value="">Select your country</option>
                            {COUNTRIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">City</label>
                        <input type="text" value={profile.city} onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="Dhaka, Dubai, London..." className="w-full sm:w-2/3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-gray-800 dark:text-gray-200" />
                    </div>
                    <div className="pt-2 flex items-center gap-3">
                        <button onClick={saveProfile} disabled={saving} className={`bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 ${saving ? 'opacity-50' : ''}`}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
                        </button>
                        {saveMsg && <span className={`text-sm font-bold ${saveMsg.startsWith('✓') ? 'text-emerald-500' : 'text-red-500'}`}>{saveMsg}</span>}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-500" /> Subscription Plan</h3>
                <div className="p-4 border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <p className="font-bold text-indigo-900 dark:text-indigo-400">{planLabel}</p>
                        <p className="text-sm text-indigo-700 dark:text-indigo-500 mt-1">Status: <span className={`font-bold px-2 py-0.5 rounded ml-1 text-[10px] tracking-wider ${statusLabel === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' : 'text-red-600 bg-red-100'}`}>{statusLabel}</span></p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-500 mt-1.5 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Expires: {endDate}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={() => handleCheckout('bkash')} disabled={saving} className="bg-[#E2136E] hover:bg-[#d10f63] text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#E2136E]/20 transition whitespace-nowrap disabled:opacity-50">
                            Pay with bKash
                        </button>
                        <button onClick={() => handleCheckout('amarpay')} disabled={saving} className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-slate-900/20 transition whitespace-nowrap disabled:opacity-50">
                            Pay with AmarPay
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm mt-8 border-t-red-500 border-t-4">
                <h3 className="font-bold text-red-600 dark:text-red-500 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">Deleting your account removes all data, including child devices, location history, and logs. This cannot be undone.</p>
                <button className="bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50 px-5 py-2.5 rounded-lg font-bold text-sm transition">Delete Account</button>
            </div>
        </div>
    );
}

// ==========================================
// MESSAGES TAB (Live Messaging Sync)
// ==========================================
function MessagesTab({ dict, child, socket }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!child?.id) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/children/${child.id}/notifications`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
            setLoading(false);
        };
        fetchMessages();

        // Listen for real-time messages
        if (socket) {
            const handleNewMessage = (data) => {
                if (data.childId === child.id) {
                    setMessages(prev => [data, ...prev]);
                }
            };
            socket.on("notification_intercepted", handleNewMessage);
            return () => socket.off("notification_intercepted", handleNewMessage);
        }
    }, [child?.id, socket]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 h-[600px] flex flex-col">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-lg border-b border-gray-100 dark:border-gray-800 pb-4">
                    <MessageSquare className="w-5 h-5 text-blue-500" /> Live Messaging Sync
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="text-gray-400 animate-pulse">Loading messages...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            <p>No messages intercepted yet. Ensure PoribarGuard is active on child&apos;s device.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className="flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${msg.appName === 'WhatsApp' ? 'bg-green-500' : msg.appName === 'Messenger' ? 'bg-blue-600' : 'bg-indigo-500'}`}>
                                    {msg.appName === 'WhatsApp' ? <PhoneCall className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/80 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700/50 max-w-[85%]">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{msg.senderName}</span>
                                        <span className="text-[10px] text-gray-500 font-medium">{timeAgo(msg.timestamp)}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{msg.text}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">{msg.appName}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// ==========================================
// SMALL UI COMPONENTS
// ==========================================
function ActionButton({ icon, label, color, shadow, pulse, onClick }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-transform group">
            <div className={`w-14 h-14 rounded-full ${color} text-white flex items-center justify-center mb-3 shadow-lg ${shadow} ${pulse ? 'animate-pulse' : ''} group-hover:scale-110 transition-transform`}>{icon}</div>
            <span className="text-xs font-bold text-center leading-tight">{label}</span>
        </button>
    );
}

function AlertRow({ icon, title, desc, time, isRed }) {
    return (
        <div className={`flex items-start gap-4 p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 ${isRed ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
            <div className={`p-2 rounded-full ${isRed ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>{icon}</div>
            <div className="flex-1">
                <h4 className={`font-bold text-sm ${isRed ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>{title}</h4>
                {desc && <p className="text-xs text-gray-500 font-medium mt-0.5">{desc}</p>}
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</p>
            </div>
        </div>
    );
}

function ToggleRow({ label, defaultChecked, childId, prayerLockId }) {
    const [checked, setChecked] = useState(defaultChecked);
    const [saving, setSaving] = useState(false);
    const { trigger } = useTogglePrayerLock(childId);

    const toggle = async () => {
        const newVal = !checked;
        // Optimistic UI update
        setChecked(newVal);
        setSaving(true);
        try {
            await trigger({ method: 'PUT', body: { prayerLockId, isActive: newVal } });
            toast.success('Settings updated');
        } catch {
            // Revert on failure
            setChecked(!newVal);
            toast.error('Failed to update settings');
        }
        setSaving(false);
    };
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <span className="font-semibold text-sm">{label}</span>
            <button onClick={toggle} disabled={saving} className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'} ${saving ? 'opacity-50' : ''}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );
}

function AppControlRow({ id, childId, name, time, isBlocked, iconColor, iconUrl, usageToday, dailyLimit, dict }) {
    const [blocked, setBlocked] = useState(isBlocked);
    const [limit, setLimit] = useState(dailyLimit || 0); // 0 means no limit
    const [saving, setSaving] = useState(false);
    const { trigger } = useToggleAppControl(childId);

    const updateControl = async (updates) => {
        setSaving(true);
        try {
            await trigger({ method: 'PUT', body: { appControlId: id, ...updates } });
            toast.success('Settings updated');
        } catch {
            toast.error('Failed to update app control');
        }
        setSaving(false);
    };

    const toggle = async () => {
        const newVal = !blocked;
        setBlocked(newVal);
        updateControl({ isBlocked: newVal }).catch(() => setBlocked(!newVal));
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        setLimit(newLimit);
        updateControl({ dailyLimit: newLimit === 0 ? null : newLimit });
    };

    // Calculate progress
    const usageSafe = usageToday || 0;
    const maxVal = limit > 0 ? limit : (usageSafe > 60 ? usageSafe + 60 : 120);
    const percent = Math.min(100, (usageSafe / maxVal) * 100);
    const isOverLimit = limit > 0 && usageSafe >= limit;

    const safeName = name || 'Unknown App';
    const initChar = typeof safeName === 'string' && safeName.length > 0 ? safeName.charAt(0).toUpperCase() : '?';

    return (
        <div className={`p-4 border ${blocked || isOverLimit ? 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'} rounded-xl transition-colors`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {iconUrl ? (
                        <img src={iconUrl} alt={safeName} className={`w-12 h-12 rounded-xl object-cover drop-shadow-sm ${blocked || isOverLimit ? 'grayscale opacity-70' : ''}`} />
                    ) : (
                        <div className={`w-12 h-12 rounded-xl ${iconColor || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-xl shadow-inner ${blocked || isOverLimit ? 'grayscale opacity-70' : ''}`}>{initChar}</div>
                    )}
                    <div>
                        <h4 className={`font-bold text-base ${blocked || isOverLimit ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {safeName} {isOverLimit && !blocked && ' (Time Up)'} {blocked && ' (Blocked)'}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">{time}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <button onClick={toggle} disabled={saving} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${saving ? 'opacity-50' : ''} ${blocked ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                        {blocked ? dict('unblock') : dict('block')}
                    </button>
                </div>
            </div>

            {/* Limit and Progress Bar Row */}
            <div className="flex items-center gap-4 mt-2">
                <div className="relative flex-1 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isOverLimit || blocked ? 'bg-red-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <select
                    value={limit}
                    onChange={handleLimitChange}
                    disabled={saving}
                    className="text-xs font-bold bg-transparent border-none text-gray-500 dark:text-gray-400 focus:ring-0 cursor-pointer outline-none"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                    <option value={0}>No Limit</option>
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                </select>
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, isActive, onClick }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'}`}>
            <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}>{React.cloneElement(icon, { className: 'w-5 h-5' })}</span>
            {label}
        </button>
    );
}

function BottomNavItem({ icon, label, isActive, onClick }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center w-16 h-14">
            <div className={`mb-1 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {React.cloneElement(icon, { className: 'w-6 h-6' })}
            </div>
            <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
        </button>
    );
}
