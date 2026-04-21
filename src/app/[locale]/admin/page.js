"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { toast } from 'sonner';
import { useAdminStats, useAdminParents, useAdminTransactions, useAdminFilters, useAdminDevices, useAdminTickets, useAdminAnalytics, useAdminSettings, useAdminSettingsMutation, useAdminLandingConfig, useAdminLandingConfigMutation, useAdminApks, useAdminApkMutation } from '@/hooks/useApi';
import AdminPackagesTab from './packages/page';
import {
    LayoutDashboard, Users, CreditCard, Smartphone, LifeBuoy,
    ShieldAlert, BarChart3, UploadCloud, Search, Bell, Settings,
    MoreVertical, ArrowUpRight, ArrowDownRight, MapPin, CheckCircle,
    XCircle, Clock, Download, Plus, Terminal, AlertTriangle,
    Filter, UserPlus, LogOut, Loader2,
    Map, RefreshCcw, FileText, Send, HardDrive, DollarSign, Mail, Database, SmartphoneCharging, Play, Pause, Server, Globe, Trash2, GripVertical, Eye, Type, Star, MessageSquare, Zap, Radio, Wifi, WifiOff, Copy, ChevronDown, ChevronUp, Activity, Shield, Menu
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminPage() {
    const t = useTranslations('Admin');
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const userName = session?.user?.name || 'Admin';
    const userEmail = session?.user?.email || '';
    const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex transition-colors duration-200">

            {/* --- SIDEBAR OVERLAY --- */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 dark:bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`w-64 fixed top-0 left-0 bottom-0 bg-slate-900 dark:bg-slate-900 text-slate-300 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="h-16 flex items-center justify-between px-6 bg-slate-950/50 border-b border-slate-800">
                    <ShieldAlert className="w-6 h-6 text-emerald-500 mr-3" />
                    <div className="flex items-center">
                        <ShieldAlert className="w-6 h-6 text-emerald-500 mr-3" />
                        <div>
                            <h1 className="text-lg font-black text-white tracking-tight leading-tight">PG Admin Hub</h1>
                            <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">PoribarGuard BD</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-6 py-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role: Super Admin</p>
                    <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                            {initials}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{userName}</p>
                            <p className="text-xs text-slate-400">{userEmail}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
                    <NavItem icon={<LayoutDashboard />} label={t('dashboard')} isActive={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Users />} label={t('parents')} isActive={activeTab === 'parents'} onClick={() => { setActiveTab('parents'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<CreditCard />} label={t('billing')} isActive={activeTab === 'billing'} onClick={() => { setActiveTab('billing'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Smartphone />} label={t('devices')} isActive={activeTab === 'devices'} onClick={() => { setActiveTab('devices'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<LifeBuoy />} label={t('support')} isActive={activeTab === 'support'} onClick={() => { setActiveTab('support'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<ShieldAlert />} label={t('filters')} isActive={activeTab === 'filters'} onClick={() => { setActiveTab('filters'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<BarChart3 />} label={t('analytics')} isActive={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<UploadCloud />} label={t('apk')} isActive={activeTab === 'apk'} onClick={() => { setActiveTab('apk'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Globe />} label="Landing Page" isActive={activeTab === 'landing'} onClick={() => { setActiveTab('landing'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Database />} label="Packages" isActive={activeTab === 'packages'} onClick={() => { setActiveTab('packages'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Radio />} label="TURN Servers" isActive={activeTab === 'turn'} onClick={() => { setActiveTab('turn'); setIsSidebarOpen(false); }} />
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-1">
                    <div className="md:hidden mb-4 space-y-3">
                        <div className="flex items-center justify-between px-3">
                            <span className="text-sm font-medium text-slate-400">Language</span>
                            <div className="scale-90 origin-right">
                                <LanguageSwitcher />
                            </div>
                        </div>
                        <div className="px-3 flex items-center gap-2 text-sm font-semibold text-emerald-500">
                            <Terminal className="w-4 h-4" /> System Status: Normal
                        </div>
                    </div>

                    <NavItem icon={<Settings />} label={t('settings')} isActive={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">{t('logOut')}</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative w-full overflow-x-hidden">

                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex flex-col">
                    <div className="h-16 flex items-center justify-between px-4 md:px-6">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-96 border border-slate-200 dark:border-slate-700">
                                <Search className="w-4 h-4 text-slate-400 mr-2" />
                                <input type="text" placeholder={t('searchPlaceholder')} className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">⌘K</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="hidden md:block">
                                <LanguageSwitcher />
                            </div>
                            <button className="hidden md:flex text-sm font-semibold text-indigo-600 dark:text-indigo-400 items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition">
                                <Terminal className="w-4 h-4" /> System Status: Normal
                            </button>
                            <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                            <ThemeToggle />
                            <button className="relative text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="md:hidden px-4 pb-3">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 w-full border border-slate-200 dark:border-slate-700">
                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                            <input type="text" placeholder={t('searchPlaceholder')} className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'parents' && <ParentsTab searchQuery={searchQuery} />}
                    {activeTab === 'billing' && <BillingTab />}
                    {activeTab === 'filters' && <FiltersTab />}
                    {activeTab === 'devices' && <DevicesTab />}
                    {activeTab === 'support' && <SupportTab />}
                    {activeTab === 'analytics' && <AnalyticsTab />}
                    {activeTab === 'apk' && <ApkTab />}
                    {activeTab === 'landing' && <LandingConfigTab />}
                    {activeTab === 'packages' && <AdminPackagesTab />}
                    {activeTab === 'turn' && <TurnServersTab />}
                    {activeTab === 'settings' && <SettingsTab />}
                </main>
            </div>
        </div>
    );
}


// ==========================================
// LOADING SKELETON
// ==========================================
function Skeleton({ className }) {
    return <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`} />;
}

function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function formatBDT(amount) {
    return '৳ ' + Number(amount).toLocaleString('en-IN');
}


// ==========================================
// DASHBOARD TAB (Real API)
// ==========================================
function DashboardTab() {
    const { stats, recentTickets, isLoading: loading, isError: error } = useAdminStats();

    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', country: '', city: '', plan: 'TRIAL' });

    const submitParent = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/parents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || 'Failed to add parent');
            } else {
                toast.success('Parent account created successfully!');
                setShowModal(false);
                setFormData({ name: '', email: '', password: '', phone: '', country: '', city: '', plan: 'TRIAL' });
            }
        } catch (err) { toast.error('An unexpected error occurred'); }
        setSaving(false);
    };

    if (loading) return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full">
                        <Skeleton className="h-4 w-32 mb-4" />
                        <Skeleton className="h-8 w-20 mb-2" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ))}
            </div>
        </div>
    );

    if (error) return <div className="text-red-500 text-center py-20">Failed to load statistics.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300 relative">
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg flex items-center gap-2"><UserPlus className="w-5 h-5 text-emerald-500" /> Provision Parent Account</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition"><XCircle className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={submitParent} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Full Name *</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
                                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Phone Number *</label><input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
                            </div>
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Email Address *</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Password *</label><input type="password" required minLength="6" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Country *</label><input type="text" required value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. Bangladesh" /></div>
                                <div><label className="text-xs font-bold text-slate-500 mb-1 block">City *</label><input type="text" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. Dhaka" /></div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Initial Subscription Plan</label>
                                <select value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50">
                                    <option value="TRIAL">7-Day Trial</option>
                                    <option value="PREMIUM">Premium (1 Year)</option>
                                    <option value="PREMIUM_PLUS">Premium Plus (1 Year)</option>
                                </select>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 flex items-center gap-2 transition shadow-sm shadow-emerald-500/30">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    {saving ? 'Creating...' : 'Create Parent'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Overview</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Live metrics from PoribarGuard BD database.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm w-full sm:w-auto">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm shadow-emerald-500/30 w-full sm:w-auto">
                        <UserPlus className="w-4 h-4" /> Add Parent
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                <StatCard title="Active Subscriptions" value={stats.activeSubscriptions.toLocaleString()} trend={`${stats.totalParents} parents`} isUp={true} icon={<Users className="w-6 h-6 text-blue-500" />} subtitle="Total BD Families" />
                <StatCard title="Total Revenue" value={formatBDT(stats.totalRevenue)} trend={`${stats.totalChildren} children`} isUp={true} icon={<CreditCard className="w-6 h-6 text-emerald-500" />} subtitle="bKash / Nagad / Rocket" />
                <StatCard title="Devices Online" value={stats.onlineDevices.toLocaleString()} trend={`${stats.todayAlerts} alerts today`} isUp={null} icon={<Smartphone className="w-6 h-6 text-indigo-500" />} subtitle="Connected devices" />
                <StatCard title="Geofence Breaches" value={stats.geofenceBreaches.toLocaleString()} trend="Today" isUp={null} icon={<AlertTriangle className="w-6 h-6 text-amber-500" />} subtitle="Requires attention" isWarning={stats.geofenceBreaches > 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-500" /> Active Devices in Bangladesh</h3>
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                    </div>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 min-h-[300px] relative p-4">
                        <div className="h-full w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 relative z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <MapPin className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600" />
                            <p className="font-semibold text-slate-600 dark:text-slate-300">Leaflet Map Integration</p>
                            <p className="text-sm mt-1">Showing {stats.onlineDevices} online devices.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold flex items-center gap-2"><LifeBuoy className="w-5 h-5 text-indigo-500" /> Open Tickets</h3>
                        <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">{stats.openTickets} Open</span>
                    </div>
                    <div className="flex-1 p-0 overflow-y-auto max-h-[300px]">
                        {recentTickets.length === 0 ? (
                            <p className="text-sm text-slate-400 p-4 text-center">No open tickets</p>
                        ) : (
                            recentTickets.map(t => (
                                <TicketRow key={t.id} title={t.title} user={`${t.userName} • ${t.userCountry || 'BD'}`} time={timeAgo(t.createdAt)} status={t.priority.toLowerCase()} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


// ==========================================
// PARENTS TAB (Real API)
// ==========================================
function ParentsTab({ searchQuery }) {
    const [page, setPage] = useState(1);

    // Reset page when search changes
    useEffect(() => { setTimeout(() => setPage(1), 0); }, [searchQuery]);

    const { parents, pagination, isLoading: loading } = useAdminParents(page, searchQuery);

    const exportCSV = () => {
        if (!parents) return;
        const header = 'Name,Email,Phone,Country,City,Plan,Status,Children';
        const rows = parents.map(p =>
            `"${p.name}","${p.email}","${p.phone || ''}","${p.country || ''}","${p.city || ''}","${p.subscription?.plan || 'None'}","${p.subscription?.status || 'None'}","${p.children.map(c => c.name).join('; ')}"`
        ).join('\n');
        const blob = new Blob([header + '\n' + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `parents_export_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold">Parents & Families Directory</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {!loading ? `${pagination.total} registered families` : 'Loading...'}
                    </p>
                </div>
                <button onClick={exportCSV} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Parent Details</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Children (BD)</th>
                                <th className="px-6 py-4">Plan Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-40 mb-1" /><Skeleton className="h-3 w-32 mt-1" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : parents?.map(p => (
                                <ParentTableRow
                                    key={p.id}
                                    name={p.name} email={p.email} phone={p.phone || '—'}
                                    ipLoc={`${p.city || ''}, ${p.country || 'BD'}`}
                                    childrenList={p.children.map(c => ({
                                        name: `${c.name} (${c.age})`,
                                        phone: c.phone || '—',
                                        status: c.isOnline ? 'online' : 'offline'
                                    }))}
                                    plan={p.subscription ? `${p.subscription.plan} ${p.subscription.billingCycle}` : 'No Plan'}
                                    status={p.subscription?.status === 'ACTIVE' ? 'active' : 'expired'}
                                    expiry={p.subscription?.endDate ? new Date(p.subscription.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
                        <span>Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total}</span>
                        <div className="flex gap-1">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Prev</button>
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded">{page}</span>
                            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


// ==========================================
// BILLING TAB (Real API)
// ==========================================
function BillingTab() {
    const { transactions, gatewayStats, isLoading: loading } = useAdminTransactions();

    const gatewayColors = {
        bKash: 'from-pink-500 to-rose-600',
        Nagad: 'from-orange-500 to-amber-600',
        Rocket: 'from-purple-500 to-indigo-600',
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold mb-6">Billing & Transactions (BD)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-xl p-5 animate-pulse">
                            <Skeleton className="h-5 w-32 mb-4" />
                            <Skeleton className="h-8 w-28 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ))
                ) : gatewayStats.map(g => (
                    <div key={g.gateway} className={`bg-gradient-to-br ${gatewayColors[g.gateway] || 'from-slate-500 to-slate-600'} rounded-xl p-5 text-white shadow-lg`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold">{g.gateway} Revenue</h3>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">All Time</span>
                        </div>
                        <p className="text-3xl font-black">{formatBDT(g.revenue)}</p>
                        <p className="text-sm text-white/70 mt-2">{g.count} transactions</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold">Recent Transactions</h3>
                </div>
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">TrxID</th>
                            <th className="px-6 py-4">Gateway</th>
                            <th className="px-6 py-4">Parent</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i}><td colSpan={6} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                            ))
                        ) : transactions.map(tx => (
                            <TrxRow key={tx.id} id={tx.trxId} gateway={tx.gateway} email={tx.parentEmail} amount={formatBDT(tx.amount)} status={tx.status} time={timeAgo(tx.createdAt)} isFail={tx.status === 'FAILED'} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


// ==========================================
// FILTERS TAB (Real API + CRUD)
// ==========================================
function FiltersTab() {
    const { domains, keywords, isLoading: loading, mutate: fetchFilters } = useAdminFilters();
    const [newDomain, setNewDomain] = useState('');
    const [newKeyword, setNewKeyword] = useState('');

    const addFilter = async (type) => {
        const pattern = type === 'DOMAIN' ? newDomain.trim() : newKeyword.trim();
        if (!pattern) return;
        const category = type === 'DOMAIN' ? 'Custom' : 'Custom';
        try {
            const res = await fetch('/api/admin/filters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pattern, type, category }),
            });
            if (!res.ok) throw new Error('Failed to add filter');
            toast.success('Filter added successfully');
            type === 'DOMAIN' ? setNewDomain('') : setNewKeyword('');
            fetchFilters();
        } catch {
            toast.error('Network error. Could not add filter.');
        }
    };

    const deleteFilter = async (id) => {
        try {
            const res = await fetch('/api/admin/filters', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error('Failed to delete filter');
            toast.success('Filter removed');
            fetchFilters();
        } catch {
            toast.error('Network error. Could not delete filter.');
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold">Global Content Filters (BD Region)</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage blacklists and keyword alerts pushed to all child devices.</p>
                </div>
                <button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Push Rules to All Devices
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Domains */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-500" /> Banned Domains ({domains?.length || 0})
                    </h3>
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                        {domains.map(f => (
                            <FilterPill key={f.id} label={f.pattern} type={f.category || 'Custom'} onDelete={() => deleteFilter(f.id)} />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="Add new domain pattern..." className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" onKeyDown={(e) => e.key === 'Enter' && addFilter('DOMAIN')} />
                        <button onClick={() => addFilter('DOMAIN')} className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
                    </div>
                </div>

                {/* Keywords */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-amber-500" /> Keyword Alerts ({keywords?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Triggers urgent alert to parent if detected in SMS, WhatsApp, or Messenger.</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {keywords.map(f => (
                            <span key={f.id} className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800/50 inline-flex items-center gap-1.5">
                                {f.pattern}
                                <button onClick={() => deleteFilter(f.id)} className="text-amber-500 hover:text-red-500 transition">
                                    <XCircle className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="Add keyword..." className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" onKeyDown={(e) => e.key === 'Enter' && addFilter('KEYWORD')} />
                        <button onClick={() => addFilter('KEYWORD')} className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
                    </div>
                </div>
            </div>
        </div>
    );
}


// ==========================================
// DEVICES TAB (Live API)
// ==========================================
function DevicesTab() {
    const { devices, isLoading: loading, mutate: fetchDevices } = useAdminDevices();

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold">Device Grid & Map</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Live view of {devices.length} connected devices</p>
                </div>
                <button onClick={fetchDevices} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> Sync Status
                </button>
            </div>

            <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-900/10 mix-blend-multiply"></div>
                <MapPin className="w-12 h-12 text-slate-400 z-10 mb-2 drop-shadow-lg" />
                <h3 className="font-bold text-slate-600 dark:text-slate-300 z-10">Leaflet Map Placeholder</h3>
                <p className="text-sm text-slate-500 z-10">Real-time device clusters appear here</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading devices...</div>
                ) : devices.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">No registered devices</div>
                ) : (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Device Info</th>
                                <th className="px-6 py-4">Linked User</th>
                                <th className="px-6 py-4">Battery</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {devices.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900 dark:text-white">{d.model || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500 font-mono">{d.deviceId?.slice(0, 12)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold">{d.childName}</p>
                                        <p className="text-xs text-slate-500">{d.parentEmail}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 font-bold text-xs ${d.batteryLevel <= 20 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            <SmartphoneCharging className="w-4 h-4" /> {d.batteryLevel}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{d.locationName || '—'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${d.isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                            {d.isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ==========================================
// SUPPORT TAB (Live API)
// ==========================================
function SupportTab() {
    const [filter, setFilter] = useState('OPEN');
    const [selected, setSelected] = useState(null);
    const { tickets, isLoading: loading, mutate: fetchTickets } = useAdminTickets(filter);

    const updateStatus = async (ticketId, newStatus) => {
        await fetch('/api/admin/tickets', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId, status: newStatus }),
        });
        fetchTickets(filter);
        if (selected?.id === ticketId) setSelected(prev => ({ ...prev, status: newStatus }));
    };

    const priorityColor = (p) => {
        if (p === 'URGENT' || p === 'HIGH') return 'text-red-500 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
        if (p === 'MEDIUM') return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
        return 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Support Tickets</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 border-r border-slate-200 dark:border-slate-800 pr-6 space-y-3">
                    <div className="flex gap-2 mb-4">
                        {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map(s => (
                            <button key={s} onClick={() => setFilter(s)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${filter === s ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'}`}>{s.replace('_', ' ')}</button>
                        ))}
                    </div>
                    {loading ? <div className="py-4 text-center text-slate-400">Loading...</div> :
                        tickets.length === 0 ? <div className="py-4 text-center text-slate-400">No {filter.toLowerCase()} tickets</div> :
                            tickets.map(t => (
                                <div key={t.id} onClick={() => setSelected(t)} className={`p-4 border rounded-xl cursor-pointer transition ${selected?.id === t.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${priorityColor(t.priority)}`}>{t.priority}</span>
                                        <span className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">{t.title}</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{t.userName} • {t.userEmail}</p>
                                </div>
                            ))}
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col min-h-[500px]">
                    {selected ? (
                        <>
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{selected.title}</h3>
                                        <p className="text-sm text-slate-500 mt-1">By <span className="font-medium text-indigo-500">{selected.userEmail}</span> • {new Date(selected.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {selected.status !== 'RESOLVED' && <button onClick={() => updateStatus(selected.id, 'RESOLVED')} className="text-xs border border-emerald-300 text-emerald-600 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">Resolve</button>}
                                        {selected.status !== 'CLOSED' && <button onClick={() => updateStatus(selected.id, 'CLOSED')} className="text-xs border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">Close</button>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-6 space-y-6 bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">{selected.userName?.slice(0, 2).toUpperCase()}</div>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{selected.description || 'No description provided.'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-xl">
                                <textarea placeholder="Type your reply here..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500" />
                                <div className="flex justify-end mt-3">
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm"><Send className="w-4 h-4" /> Send Reply</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <FileText className="w-12 h-12 mb-3 opacity-50" />
                            <p className="font-bold">Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



// ==========================================
// ANALYTICS TAB (Live API)
// ==========================================
function AnalyticsTab() {
    const { analytics: data, isLoading: loading } = useAdminAnalytics();

    if (loading) return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;

    const regDays = data?.registrationsByDay ? Object.entries(data.registrationsByDay) : [];
    const maxReg = Math.max(1, ...regDays.map(([, v]) => v));

    const alertTypes = data?.alertDistribution ? Object.entries(data.alertDistribution) : [];
    const maxAlert = Math.max(1, ...alertTypes.map(([, v]) => v));

    const alertColors = { GEOFENCE_EXIT: 'bg-orange-500', SOS: 'bg-red-500', APP_INSTALL: 'bg-blue-500', KEYWORD: 'bg-amber-500', LOW_BATTERY: 'bg-yellow-500', SCREEN_TIME: 'bg-purple-500' };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold">Analytics & Reports</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registration bar chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold mb-6 text-slate-800 dark:text-slate-200">User Registration (Last 7 Days)</h3>
                    <div className="flex items-end gap-2 h-48 border-b border-slate-200 dark:border-slate-800 pb-2">
                        {regDays.map(([day, count], i) => {
                            const pct = (count / maxReg) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                                    <div className="bg-emerald-500/80 w-full rounded-t-sm group-hover:bg-emerald-500 transition-colors relative" style={{ height: `${Math.max(pct, 4)}%` }}>
                                        <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 dark:text-slate-300 transition">{count}</span>
                                    </div>
                                    <span className="text-[10px] text-center mt-2 text-slate-500">{day.slice(5)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Alert distribution */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold mb-6 text-slate-800 dark:text-slate-200">Alert Triggers by Type (30d)</h3>
                    <div className="space-y-4">
                        {alertTypes.length === 0 ? <p className="text-sm text-slate-400">No alerts in last 30 days</p> :
                            alertTypes.map(([type, count], i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                                        <span>{type.replace(/_/g, ' ')}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${alertColors[type] || 'bg-indigo-500'} rounded-full`} style={{ width: `${(count / maxAlert) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Plan distribution + Top countries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold mb-4 text-slate-800 dark:text-slate-200">Subscription Plan Distribution</h3>
                    <div className="space-y-3">
                        {data?.planDistribution ? Object.entries(data.planDistribution).map(([plan, count]) => (
                            <div key={plan} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="font-bold text-sm">{plan}</span>
                                <span className="text-sm font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">{count}</span>
                            </div>
                        )) : <p className="text-sm text-slate-400">No subscriptions</p>}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold mb-4 text-slate-800 dark:text-slate-200">Top Countries</h3>
                    <div className="space-y-3">
                        {data?.topCountries?.length > 0 ? data.topCountries.map((c, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="font-bold text-sm">{c.country || 'Unknown'}</span>
                                <span className="text-sm font-mono bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">{c.count} users</span>
                            </div>
                        )) : <p className="text-sm text-slate-400">No country data</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Generate Custom Report</h3>
                    <p className="text-sm text-slate-500 mt-1">Export detailed DB dumps in CSV or PDF formats.</p>
                </div>
                <button className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition hover:opacity-90">
                    <Download className="w-4 h-4" /> Download Dump
                </button>
            </div>
        </div>
    );
}

// ==========================================
// APK MANAGEMENT TAB
// ==========================================
function ApkTab() {
    const { apks, isLoading, mutate } = useAdminApks();
    const { trigger: apkAction } = useAdminApkMutation();
    const [showModal, setShowModal] = useState(false);

    // Upload State
    const [file, setFile] = useState(null);
    const [version, setVersion] = useState('');
    const [buildNumber, setBuildNumber] = useState('');
    const [targetSdk, setTargetSdk] = useState('34');
    const [releaseNotes, setReleaseNotes] = useState('');
    const [isCritical, setIsCritical] = useState(false);
    const [appType, setAppType] = useState('CHILD'); // 'CHILD' or 'WIZARD'
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleAction = async (id, actionType) => {
        try {
            if (actionType === 'DELETE') {
                if (!confirm('Are you sure you want to delete this APK?')) return;
                await apkAction({ method: 'DELETE', body: {} }, { url: `/api/admin/apk?id=${id}` });
                toast.success('APK deleted');
            } else if (actionType === 'ACTIVATE') {
                await apkAction({ method: 'PUT', body: { id } });
                toast.success('APK set as LIVE');
            }
            mutate();
        } catch (e) {
            toast.error(e.message || 'Action failed');
        }
    };

    const handleUpload = () => {
        if (!file || !version || !buildNumber) {
            toast.error('File, Version, and Build Number are required');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('version', version);
        formData.append('buildNumber', buildNumber);
        formData.append('targetSdk', targetSdk);
        formData.append('releaseNotes', releaseNotes);
        formData.append('isCriticalUpdate', isCritical);
        formData.append('appType', appType);

        setIsUploading(true);
        setProgress(0);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/apk/upload', true);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setProgress(percent);
            }
        };

        xhr.onload = () => {
            setIsUploading(false);
            setProgress(0);
            if (xhr.status >= 200 && xhr.status < 300) {
                toast.success('Build uploaded successfully!');
                setShowModal(false);
                setFile(null);
                setVersion('');
                setBuildNumber('');
                setReleaseNotes('');
                setIsCritical(false);
                setAppType('CHILD');
                mutate();
            } else {
                let err = 'Upload failed';
                try { err = JSON.parse(xhr.responseText).error || err; } catch (e) { }
                toast.error(err);
            }
        };

        xhr.onerror = () => {
            setIsUploading(false);
            setProgress(0);
            toast.error('Network error during upload');
        };

        xhr.send(formData);
    };

    const liveChildApk = apks?.find(a => a.status === 'LIVE' && a.appType === 'CHILD');
    const liveWizardApk = apks?.find(a => a.status === 'LIVE' && a.appType === 'WIZARD');

    return (
        <div className="space-y-6 animate-in fade-in duration-300 relative">
            <h2 className="text-xl font-bold">APK Management & OTA Updates</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Child App Release */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 flex flex-col items-start gap-4 h-full">
                    <div className="flex-1 w-full relative h-full">
                        <div className="absolute top-0 right-0">
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 text-[10px] font-bold uppercase rounded border border-indigo-200 dark:border-indigo-700">Client Payload</span>
                        </div>
                        <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-400 mb-2">Main Child App</h3>
                        {liveChildApk ? (
                            <>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300">Version: <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded ml-1 border border-indigo-100 dark:border-indigo-700">{liveChildApk.version} (Build {liveChildApk.buildNumber})</span></p>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Uploaded: <span className="font-semibold">{new Date(liveChildApk.createdAt).toLocaleDateString()}</span></p>
                            </>
                        ) : (
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">No LIVE release currently set.</p>
                        )}
                    </div>
                </div>

                {/* Wizard App Release */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 flex flex-col items-start gap-4 h-full">
                    <div className="flex-1 w-full relative h-full">
                        <div className="absolute top-0 right-0">
                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-1 text-[10px] font-bold uppercase rounded border border-emerald-200 dark:border-emerald-700">Bypass Tool</span>
                        </div>
                        <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-400 mb-2">Wizard Installer</h3>
                        {liveWizardApk ? (
                            <>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">Version: <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded ml-1 border border-emerald-100 dark:border-emerald-700">{liveWizardApk.version} (Build {liveWizardApk.buildNumber})</span></p>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">Uploaded: <span className="font-semibold">{new Date(liveWizardApk.createdAt).toLocaleDateString()}</span></p>
                            </>
                        ) : (
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">No LIVE release currently set.</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end mt-[-10px]">
                    <button onClick={() => setShowModal(true)} className="whitespace-nowrap w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition">
                        <UploadCloud className="w-5 h-5" /> Upload New Build
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading versions...
                    </div>
                ) : apks?.length === 0 ? (
                    <div className="flex justify-center items-center h-48 text-slate-400">
                        No APKs uploaded yet.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Version Info</th>
                                <th className="px-6 py-4">File Size</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date Uploaded</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {apks?.map((apk) => (
                                <tr key={apk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900 dark:text-white">{apk.version}</p>
                                            {apk.appType === 'WIZARD' ? (
                                                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider">Wizard</span>
                                            ) : (
                                                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider">Child App</span>
                                            )}
                                            {apk.isCriticalUpdate && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider">Critical</span>}
                                        </div>
                                        <p className="text-xs text-slate-500">Build {apk.buildNumber} • Target SDK {apk.targetSdk}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">{apk.fileSize}</td>
                                    <td className="px-6 py-4">
                                        {apk.status === 'LIVE' ? (
                                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-[10px] tracking-wider font-extrabold rounded">LIVE (PRODUCTION)</span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[10px] tracking-wider font-extrabold rounded">ARCHIVED</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(apk.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {apk.status !== 'LIVE' && (
                                            <>
                                                <button onClick={() => handleAction(apk.id, 'ACTIVATE')} className="text-indigo-600 dark:text-indigo-400 font-bold text-xs bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition border border-transparent">Set Active</button>
                                                <button onClick={() => handleAction(apk.id, 'DELETE')} className="text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 p-1.5 rounded transition"><Trash2 className="w-4 h-4" /></button>
                                            </>
                                        )}
                                        {apk.status === 'LIVE' && (
                                            <button disabled className="text-emerald-500 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded disabled:opacity-50 cursor-default border border-transparent">Active</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200"><UploadCloud className="w-5 h-5 text-indigo-500" /> Upload New Build</h3>
                            {!isUploading && <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"><XCircle className="w-5 h-5" /></button>}
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5">
                            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${file ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                <input type="file" accept=".apk" onChange={e => setFile(e.target.files[0])} className="hidden" id="apk-upload" disabled={isUploading} />
                                <label htmlFor="apk-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition ${file ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                        <UploadCloud className={`w-6 h-6 ${file ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                    </div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{file ? file.name : 'Click to browse APK file'}</p>
                                    <p className="text-xs text-slate-500 mt-1">{file ? `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Max size: 100MB'}</p>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">App Type <span className="text-red-500">*</span></label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${appType === 'CHILD' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}>
                                            <input type="radio" name="appType" value="CHILD" checked={appType === 'CHILD'} onChange={(e) => setAppType(e.target.value)} className="hidden" />
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${appType === 'CHILD' ? 'border-indigo-500' : 'border-slate-300'}`}>
                                                {appType === 'CHILD' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                            </div>
                                            <span className="font-bold text-sm">Main Child App</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${appType === 'WIZARD' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}>
                                            <input type="radio" name="appType" value="WIZARD" checked={appType === 'WIZARD'} onChange={(e) => setAppType(e.target.value)} className="hidden" />
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${appType === 'WIZARD' ? 'border-emerald-500' : 'border-slate-300'}`}>
                                                {appType === 'WIZARD' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                            </div>
                                            <span className="font-bold text-sm">Wizard Installer</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Version String <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="e.g. v2.1.5" value={version} onChange={e => setVersion(e.target.value)} disabled={isUploading} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Build Number <span className="text-red-500">*</span></label>
                                    <input type="number" placeholder="e.g. 43" value={buildNumber} onChange={e => setBuildNumber(e.target.value)} disabled={isUploading} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target SDK</label>
                                <input type="number" placeholder="e.g. 34" value={targetSdk} onChange={e => setTargetSdk(e.target.value)} disabled={isUploading} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Release Notes</label>
                                <textarea placeholder="What's new in this version?" value={releaseNotes} onChange={e => setReleaseNotes(e.target.value)} disabled={isUploading} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] dark:text-slate-200 transition" />
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg transition hover:bg-red-100/50">
                                <input type="checkbox" checked={isCritical} onChange={e => setIsCritical(e.target.checked)} disabled={isUploading} className="mt-0.5 rounded text-red-600 focus:ring-red-500 bg-white border-red-200" />
                                <div>
                                    <p className="text-sm font-bold text-red-800 dark:text-red-400">Critical Update</p>
                                    <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">Force all child devices to download and install this immediately upon next ping.</p>
                                </div>
                            </label>

                            {isUploading && (
                                <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                                        <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to server...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-2xl">
                            {!isUploading && <button onClick={() => setShowModal(false)} className="px-5 py-2.5 font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>}
                            <button onClick={handleUpload} disabled={isUploading || !file || !version || !buildNumber} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm disabled:opacity-50 transition flex items-center gap-2">
                                {isUploading ? 'Please wait...' : 'Start Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// SETTINGS TAB (Live API)
// ==========================================
function SettingsTab() {
    const { settings: initialSettings, isLoading: loading } = useAdminSettings();
    const { trigger: saveSettings } = useAdminSettingsMutation();

    const [settings, setSettings] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (initialSettings && Object.keys(initialSettings).length > 0) {
            setTimeout(() => setSettings(initialSettings), 0);
        }
    }, [initialSettings]);

    const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

    const save = async () => {
        setSaving(true);
        try {
            await saveSettings({ method: 'PUT', body: settings });
            toast.success('Settings saved successfully');
        } catch (e) {
            toast.error(e.message || 'Network error saving settings');
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

    const inputCls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-800 dark:text-slate-200";

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
            <h2 className="text-xl font-bold">System Configuration</h2>

            <div className="space-y-6">
                {/* Trial */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Clock className="w-5 h-5 text-blue-500" /> Trial Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Trial Days (for new registrations)</label>
                            <input type="number" value={settings.trial_days || '7'} onChange={e => update('trial_days', e.target.value)} className={inputCls} min="1" max="90" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Maintenance Mode</label>
                            <select value={settings.maintenance_mode || 'false'} onChange={e => update('maintenance_mode', e.target.value)} className={inputCls}>
                                <option value="false">Off — Normal Operation</option>
                                <option value="true">On — Show Maintenance Page</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Default Language</label>
                            <select value={settings.default_locale || 'en'} onChange={e => update('default_locale', e.target.value)} className={inputCls}>
                                <option value="en">English (en)</option>
                                <option value="bn">Bengali (bn)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payments */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <DollarSign className="w-5 h-5 text-emerald-500" /> Payment Gateways (BD)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">bKash Merchant Number</label>
                            <input type="text" value={settings.bkash_merchant || ''} onChange={e => update('bkash_merchant', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">AmarPay Store ID</label>
                            <input type="text" value={settings.amarpay_store_id || ''} onChange={e => update('amarpay_store_id', e.target.value)} className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Mail className="w-5 h-5 text-indigo-500" /> Notification Providers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">SSL Wireless SMS API Key</label>
                            <input type="password" value={settings.ssl_sms_api_key || ''} onChange={e => update('ssl_sms_api_key', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">SendGrid API Key</label>
                            <input type="password" value={settings.sendgrid_api_key || ''} onChange={e => update('sendgrid_api_key', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">FCM Server Key (Push Notifications)</label>
                            <input type="password" value={settings.fcm_server_key || ''} onChange={e => update('fcm_server_key', e.target.value)} className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* Danger */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Database className="w-5 h-5 text-slate-500" /> Danger Zone
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg gap-4">
                        <div>
                            <p className="font-bold text-red-700 dark:text-red-400">Clear Telemetry Logs</p>
                            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Permanently deletes all device location history and system logs older than 30 days.</p>
                        </div>
                        <button className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow transition">Clear Logs</button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 pb-8">
                {msg && <span className={`text-sm font-bold ${msg.includes('✅') ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</span>}
                <div className="ml-auto">
                    <button onClick={save} disabled={saving} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 dark:shadow-white/10 dark:hover:shadow-white/20 transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// LANDING PAGE CONFIGURATION TAB
// ==========================================
function LandingConfigTab() {
    const { landingConfig, isLoading: loading, mutate: refetch } = useAdminLandingConfig();
    const { trigger: saveLanding } = useAdminLandingConfigMutation();
    const [activeSection, setActiveSection] = useState('hero');
    const [saving, setSaving] = useState(false);

    // Local state for each section
    const [heroConfig, setHeroConfig] = useState(null);
    const [featuresConfig, setFeaturesConfig] = useState(null);
    const [pricingConfig, setPricingConfig] = useState(null);
    const [faqConfig, setFaqConfig] = useState(null);
    const [testimonialsConfig, setTestimonialsConfig] = useState(null);
    const [howItWorksConfig, setHowItWorksConfig] = useState(null);
    const [ctaConfig, setCtaConfig] = useState(null);
    const [footerConfig, setFooterConfig] = useState(null);

    // Initialize local state from fetched data
    useEffect(() => {
        if (landingConfig && Object.keys(landingConfig).length >= 0) {
            setTimeout(() => {
                setHeroConfig(landingConfig.landing_hero || {
                    badgeText: 'BD EDITION — #1 PARENTAL CONTROL APP',
                    locations: [
                        { host: 'Dubai', home: 'Jessore' },
                        { host: 'Riyadh', home: 'Sylhet' },
                        { host: 'London', home: 'Dhaka' },
                        { host: 'Malaysia', home: 'Comilla' },
                        { host: 'Oman', home: 'Chittagong' },
                        { host: 'Singapore', home: 'Barisal' }
                    ],
                    ctaText: 'Start Free 7-Day Trial',
                    ctaLink: '/dashboard',
                    videoBtnText: 'Watch 45-sec Video',
                    trustBadges: ['Trusted by 2,347+ BD families', '100% Legal', 'bKash/Nagad Accepted'],
                    heroTheme: 'dark'
                });
                setFeaturesConfig(landingConfig.landing_features || {
                    sectionTag: '6 Core Pillars',
                    sectionTitle: 'যা আপনি পাবেন — শুধুমাত্র PoribarGuard BD-এ',
                    features: [
                        { title: 'Remote Install from Abroad', desc: 'TeamViewer বা Magic APK দিয়ে দূর থেকে ইনস্টল করুন', icon: 'DownloadCloud', color: 'blue' },
                        { title: 'Live Location + Village Geofence', desc: 'স্কুল, টিউশন, বাড়ি, মসজিদ — সব জায়গায় সীমানা', icon: 'Map', color: 'emerald' },
                        { title: 'Live Camera, Mic & Screen', desc: 'চাইলেই দেখুন, শুনুন, স্ক্রিন দেখুন (on-demand)', icon: 'Video', color: 'red' },
                        { title: 'Prayer Time + Study Auto Lock', desc: 'Fajr, Maghrib, Isha ও পড়াশোনার সময় অটো লক', icon: 'Clock', color: 'indigo' },
                        { title: 'SOS Panic Button', desc: 'এক ট্যাপে লোকেশন + ভয়েস নোট + ফটো পাঠায়', icon: 'ShieldAlert', color: 'orange' },
                        { title: 'Full Stealth Mode', desc: 'শিশু কখনো জানবে না যে মনিটর হচ্ছে', icon: 'EyeOff', color: 'gray' }
                    ]
                });
                setPricingConfig(landingConfig.landing_pricing || {
                    sectionTitle: 'সাশ্রয়ী মূল্যে পরিবারের নিরাপত্তা',
                    sectionSubtitle: 'Pay securely via bKash, Nagad, or any International Card.',
                    saveBadge: 'Save 20% on Annual Plans (2 months FREE)',
                    plans: []
                });
                setFaqConfig(landingConfig.landing_faq || { sectionTitle: 'FAQ', faqs: [] });
                setTestimonialsConfig(landingConfig.landing_testimonials || { sectionTitle: 'Reviews', testimonials: [] });
                setHowItWorksConfig(landingConfig.landing_how_it_works || { sectionTitle: 'How It Works', steps: [] });
                setCtaConfig(landingConfig.landing_cta || { heading: 'Start now', buttonText: 'Click here' });
                setFooterConfig(landingConfig.landing_footer || { description: 'Footer', contactEmail: 'test@test.com' });
            }, 0);
        }
    }, [landingConfig]);

    const saveSection = async (sectionKey, data) => {
        setSaving(true);
        try {
            await saveLanding({ method: 'PUT', body: { section: sectionKey, data } });
            toast.success(`${sectionKey.replace('landing_', '').replace(/_/g, ' ')} updated!`);
            refetch();
        } catch (e) {
            toast.error(e.message || 'Failed to save');
        }
        setSaving(false);
    };

    if (loading || !heroConfig) return <div className="p-8 text-center text-slate-400">Loading landing page config...</div>;

    const inputCls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-800 dark:text-slate-200";
    const textareaCls = inputCls + " min-h-[80px] resize-y";
    const btnSaveCls = "bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm shadow-emerald-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2 text-sm";
    const btnAddCls = "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2";
    const btnRemoveCls = "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition";
    const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5";
    const cardCls = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5";

    const sections = [
        { key: 'hero', label: 'Hero', icon: <Zap className="w-4 h-4" /> },
        { key: 'features', label: 'Features', icon: <Star className="w-4 h-4" /> },
        { key: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
        { key: 'faq', label: 'FAQ', icon: <MessageSquare className="w-4 h-4" /> },
        { key: 'testimonials', label: 'Testimonials', icon: <Users className="w-4 h-4" /> },
        { key: 'howitworks', label: 'How It Works', icon: <Play className="w-4 h-4" /> },
        { key: 'cta', label: 'CTA Banner', icon: <Type className="w-4 h-4" /> },
        { key: 'footer', label: 'Footer', icon: <FileText className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2"><Globe className="w-6 h-6 text-emerald-500" /> Landing Page Configuration</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Edit all sections of the public landing page from here.</p>
                </div>
            </div>

            {/* Sub-tab navigation */}
            <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                {sections.map(s => (
                    <button
                        key={s.key}
                        onClick={() => setActiveSection(s.key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === s.key ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        {s.icon} {s.label}
                    </button>
                ))}
            </div>

            {/* === HERO SECTION === */}
            {activeSection === 'hero' && (
                <div className={cardCls}>
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Hero Section</h3>
                    <div>
                        <label className={labelCls}>Badge Text</label>
                        <input type="text" value={heroConfig.badgeText} onChange={e => setHeroConfig({ ...heroConfig, badgeText: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>CTA Button Text</label>
                        <input type="text" value={heroConfig.ctaText} onChange={e => setHeroConfig({ ...heroConfig, ctaText: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>CTA Button Link</label>
                        <input type="text" value={heroConfig.ctaLink} onChange={e => setHeroConfig({ ...heroConfig, ctaLink: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Video Button Text</label>
                        <input type="text" value={heroConfig.videoBtnText} onChange={e => setHeroConfig({ ...heroConfig, videoBtnText: e.target.value })} className={inputCls} />
                    </div>

                    {/* Location Pairs */}
                    <div>
                        <label className={labelCls}>Rotating Location Pairs</label>
                        <div className="space-y-2">
                            {heroConfig.locations.map((loc, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input type="text" value={loc.host} onChange={e => { const locs = [...heroConfig.locations]; locs[idx] = { ...locs[idx], host: e.target.value }; setHeroConfig({ ...heroConfig, locations: locs }); }} className={inputCls} placeholder="Host city (e.g. Dubai)" />
                                    <span className="text-slate-400 font-bold">→</span>
                                    <input type="text" value={loc.home} onChange={e => { const locs = [...heroConfig.locations]; locs[idx] = { ...locs[idx], home: e.target.value }; setHeroConfig({ ...heroConfig, locations: locs }); }} className={inputCls} placeholder="Home district" />
                                    <button onClick={() => { const locs = heroConfig.locations.filter((_, i) => i !== idx); setHeroConfig({ ...heroConfig, locations: locs }); }} className={btnRemoveCls}><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button onClick={() => setHeroConfig({ ...heroConfig, locations: [...heroConfig.locations, { host: '', home: '' }] })} className={btnAddCls}><Plus className="w-4 h-4" /> Add Location Pair</button>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div>
                        <label className={labelCls}>Trust Badges</label>
                        <div className="space-y-2">
                            {heroConfig.trustBadges.map((badge, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input type="text" value={badge} onChange={e => { const badges = [...heroConfig.trustBadges]; badges[idx] = e.target.value; setHeroConfig({ ...heroConfig, trustBadges: badges }); }} className={inputCls} />
                                    <button onClick={() => { const badges = heroConfig.trustBadges.filter((_, i) => i !== idx); setHeroConfig({ ...heroConfig, trustBadges: badges }); }} className={btnRemoveCls}><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button onClick={() => setHeroConfig({ ...heroConfig, trustBadges: [...heroConfig.trustBadges, ''] })} className={btnAddCls}><Plus className="w-4 h-4" /> Add Badge</button>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Hero Theme Override</label>
                        <select value={heroConfig.heroTheme || 'dark'} onChange={e => setHeroConfig({ ...heroConfig, heroTheme: e.target.value })} className={inputCls}>
                            <option value="dark">Dark Theme (Default Premium)</option>
                            <option value="light">Light Theme</option>
                            <option value="auto">Auto (Matches User Prefs)</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => saveSection('landing_hero', heroConfig)} disabled={saving} className={btnSaveCls}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Hero
                        </button>
                    </div>
                </div>
            )}

            {/* === FEATURES SECTION === */}
            {activeSection === 'features' && (
                <div className={cardCls}>
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Features Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Section Tag</label>
                            <input type="text" value={featuresConfig.sectionTag} onChange={e => setFeaturesConfig({ ...featuresConfig, sectionTag: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Section Title</label>
                            <input type="text" value={featuresConfig.sectionTitle} onChange={e => setFeaturesConfig({ ...featuresConfig, sectionTitle: e.target.value })} className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Features List</label>
                        <div className="space-y-4">
                            {featuresConfig.features.map((feat, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400">Feature #{idx + 1}</span>
                                        <button onClick={() => { const feats = featuresConfig.features.filter((_, i) => i !== idx); setFeaturesConfig({ ...featuresConfig, features: feats }); }} className={btnRemoveCls}><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <input type="text" value={feat.title} onChange={e => { const feats = [...featuresConfig.features]; feats[idx] = { ...feats[idx], title: e.target.value }; setFeaturesConfig({ ...featuresConfig, features: feats }); }} className={inputCls} placeholder="Title" />
                                    <textarea value={feat.desc} onChange={e => { const feats = [...featuresConfig.features]; feats[idx] = { ...feats[idx], desc: e.target.value }; setFeaturesConfig({ ...featuresConfig, features: feats }); }} className={textareaCls} placeholder="Description" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelCls}>Icon Name</label>
                                            <input type="text" value={feat.icon} onChange={e => { const feats = [...featuresConfig.features]; feats[idx] = { ...feats[idx], icon: e.target.value }; setFeaturesConfig({ ...featuresConfig, features: feats }); }} className={inputCls} placeholder="e.g. Map, Video, Clock" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Color</label>
                                            <select value={feat.color} onChange={e => { const feats = [...featuresConfig.features]; feats[idx] = { ...feats[idx], color: e.target.value }; setFeaturesConfig({ ...featuresConfig, features: feats }); }} className={inputCls}>
                                                {['blue', 'emerald', 'red', 'indigo', 'orange', 'gray', 'purple', 'pink', 'yellow'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setFeaturesConfig({ ...featuresConfig, features: [...featuresConfig.features, { title: '', desc: '', icon: 'Star', color: 'blue' }] })} className={btnAddCls}><Plus className="w-4 h-4" /> Add Feature</button>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => saveSection('landing_features', featuresConfig)} disabled={saving} className={btnSaveCls}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Features
                        </button>
                    </div>
                </div>
            )}

            {/* === PRICING SECTION === */}
            {activeSection === 'pricing' && (
                <div className={cardCls}>
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-500" /> Pricing Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Section Title</label><input type="text" value={pricingConfig.sectionTitle} onChange={e => setPricingConfig({ ...pricingConfig, sectionTitle: e.target.value })} className={inputCls} /></div>
                        <div><label className={labelCls}>Save Badge Text</label><input type="text" value={pricingConfig.saveBadge} onChange={e => setPricingConfig({ ...pricingConfig, saveBadge: e.target.value })} className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>Subtitle</label><input type="text" value={pricingConfig.sectionSubtitle} onChange={e => setPricingConfig({ ...pricingConfig, sectionSubtitle: e.target.value })} className={inputCls} /></div>

                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                        <p className="font-bold mb-1">Pricing Tiers are now managed automatically!</p>
                        <p>The pricing cards shown on the landing page are synced in real-time with the active Subscription Packages you create in the <strong>Subscription Packages</strong> tab.</p>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => saveSection('landing_pricing', { sectionTitle: pricingConfig.sectionTitle, saveBadge: pricingConfig.saveBadge, sectionSubtitle: pricingConfig.sectionSubtitle })} disabled={saving} className={btnSaveCls}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Pricing Header
                        </button>
                    </div>
                </div>
            )}

            {/* === FAQ SECTION === */}
            {activeSection === 'faq' && (
                <div className={cardCls}>
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-500" /> FAQ Section</h3>
                    <div><label className={labelCls}>Section Title</label><input type="text" value={faqConfig.sectionTitle} onChange={e => setFaqConfig({ ...faqConfig, sectionTitle: e.target.value })} className={inputCls} /></div>
                    <div>
                        <label className={labelCls}>Questions & Answers</label>
                        <div className="space-y-4">
                            {faqConfig.faqs.map((faq, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400">Q&A #{idx + 1}</span>
                                        <button onClick={() => { const faqs = faqConfig.faqs.filter((_, i) => i !== idx); setFaqConfig({ ...faqConfig, faqs }); }} className={btnRemoveCls}><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <input type="text" value={faq.q} onChange={e => { const faqs = [...faqConfig.faqs]; faqs[idx] = { ...faqs[idx], q: e.target.value }; setFaqConfig({ ...faqConfig, faqs }); }} className={inputCls} placeholder="Question" />
                                    <textarea value={faq.a} onChange={e => { const faqs = [...faqConfig.faqs]; faqs[idx] = { ...faqs[idx], a: e.target.value }; setFaqConfig({ ...faqConfig, faqs }); }} className={textareaCls} placeholder="Answer" />
                                </div>
                            ))}
                            <button onClick={() => setFaqConfig({ ...faqConfig, faqs: [...faqConfig.faqs, { q: '', a: '' }] })} className={btnAddCls}><Plus className="w-4 h-4" /> Add Q&A</button>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => saveSection('landing_faq', faqConfig)} disabled={saving} className={btnSaveCls}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save FAQ
                        </button>
                    </div>
                </div>
            )}

            {/* === TESTIMONIALS SECTION === */}
            {activeSection === 'testimonials' && (
                <div className={cardCls}>
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" /> Testimonials Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Section Title</label><input type="text" value={testimonialsConfig.sectionTitle} onChange={e => setTestimonialsConfig({ ...testimonialsConfig, sectionTitle: e.target.value })} className={inputCls} /></div>
                        <div><label className={labelCls}>Stats Badge</label><input type="text" value={testimonialsConfig.statBadge} onChange={e => setTestimonialsConfig({ ...testimonialsConfig, statBadge: e.target.value })} className={inputCls} /></div>
                    </div>
                    <div>
                        <label className={labelCls}>Testimonials</label>
                        <div className="space-y-4">
                            {testimonialsConfig.testimonials.map((t, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400">Review #{idx + 1}</span>
                                        <button onClick={() => { const ts = testimonialsConfig.testimonials.filter((_, i) => i !== idx); setTestimonialsConfig({ ...testimonialsConfig, testimonials: ts }); }} className={btnRemoveCls}><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input type="text" value={t.name} onChange={e => { const ts = [...testimonialsConfig.testimonials]; ts[idx] = { ...ts[idx], name: e.target.value }; setTestimonialsConfig({ ...testimonialsConfig, testimonials: ts }); }} className={inputCls} placeholder="Name" />
                                        <input type="text" value={t.location} onChange={e => { const ts = [...testimonialsConfig.testimonials]; ts[idx] = { ...ts[idx], location: e.target.value }; setTestimonialsConfig({ ...testimonialsConfig, testimonials: ts }); }} className={inputCls} placeholder="Location (e.g. 🇦🇪 Dubai)" />
                                    </div>
                                    <textarea value={t.text} onChange={e => { const ts = [...testimonialsConfig.testimonials]; ts[idx] = { ...ts[idx], text: e.target.value }; setTestimonialsConfig({ ...testimonialsConfig, testimonials: ts }); }} className={textareaCls} placeholder="Review text" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div><label className={labelCls}>Rating (1-5)</label><input type="number" min="1" max="5" value={t.rating} onChange={e => { const ts = [...testimonialsConfig.testimonials]; ts[idx] = { ...ts[idx], rating: parseInt(e.target.value) || 5 }; setTestimonialsConfig({ ...testimonialsConfig, testimonials: ts }); }} className={inputCls} /></div>
                                        <div><label className={labelCls}>Avatar URL</label><input type="text" value={t.imgUrl} onChange={e => { const ts = [...testimonialsConfig.testimonials]; ts[idx] = { ...ts[idx], imgUrl: e.target.value }; setTestimonialsConfig({ ...testimonialsConfig, testimonials: ts }); }} className={inputCls} placeholder="https://..." /></div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setTestimonialsConfig({ ...testimonialsConfig, testimonials: [...testimonialsConfig.testimonials, { name: '', location: '', text: '', rating: 5, imgUrl: '' }] })} className={btnAddCls}><Plus className="w-4 h-4" /> Add Testimonial</button>
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Featured Logos (one per line)</label>
                        <textarea value={testimonialsConfig.featuredLogos.join('\n')} onChange={e => setTestimonialsConfig({ ...testimonialsConfig, featuredLogos: e.target.value.split('\n') })} className={textareaCls} placeholder="One logo/brand per line" />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => saveSection('landing_testimonials', testimonialsConfig)} disabled={saving} className={btnSaveCls}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Testimonials
                        </button>
                    </div>
                </div>
            )}

            {/* === HOW IT WORKS SECTION === */}
            {activeSection === 'howitworks' && (
                <div className={cardCls}>
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><Play className="w-5 h-5 text-emerald-500" /> How It Works Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Section Title</label><input type="text" value={howItWorksConfig.sectionTitle} onChange={e => setHowItWorksConfig({ ...howItWorksConfig, sectionTitle: e.target.value })} className={inputCls} /></div>
                        <div><label className={labelCls}>Subtitle</label><input type="text" value={howItWorksConfig.sectionSubtitle} onChange={e => setHowItWorksConfig({ ...howItWorksConfig, sectionSubtitle: e.target.value })} className={inputCls} /></div>
                    </div>
                    <div>
                        <label className={labelCls}>Steps</label>
                        <div className="space-y-4">
                            {howItWorksConfig.steps.map((step, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-emerald-500">Step {idx + 1}</span>
                                        <button onClick={() => { const s = howItWorksConfig.steps.filter((_, i) => i !== idx); setHowItWorksConfig({ ...howItWorksConfig, steps: s }); }} className={btnRemoveCls}><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <input type="text" value={step.title} onChange={e => { const s = [...howItWorksConfig.steps]; s[idx] = { ...s[idx], title: e.target.value }; setHowItWorksConfig({ ...howItWorksConfig, steps: s }); }} className={inputCls} placeholder="Step Title" />
                                    <textarea value={step.desc} onChange={e => { const s = [...howItWorksConfig.steps]; s[idx] = { ...s[idx], desc: e.target.value }; setHowItWorksConfig({ ...howItWorksConfig, steps: s }); }} className={textareaCls} placeholder="Step Description" />
                                </div>
                            ))}
                            <button onClick={() => setHowItWorksConfig({ ...howItWorksConfig, steps: [...howItWorksConfig.steps, { title: '', desc: '' }] })} className={btnAddCls}><Plus className="w-4 h-4" /> Add Step</button>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => saveSection('landing_howitworks', howItWorksConfig)} disabled={saving} className={btnSaveCls}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save How It Works
                        </button>
                    </div>
                </div>
            )}

            {/* === CTA BANNER SECTION === */}
            {activeSection === 'cta' && (
                <div className={cardCls}>
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><Type className="w-5 h-5 text-emerald-500" /> CTA Banner Section</h3>
                    <div><label className={labelCls}>Heading</label><input type="text" value={ctaConfig.heading} onChange={e => setCtaConfig({ ...ctaConfig, heading: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Subheading</label><input type="text" value={ctaConfig.subheading} onChange={e => setCtaConfig({ ...ctaConfig, subheading: e.target.value })} className={inputCls} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Button Text</label><input type="text" value={ctaConfig.btnText} onChange={e => setCtaConfig({ ...ctaConfig, btnText: e.target.value })} className={inputCls} /></div>
                        <div><label className={labelCls}>Button Link</label><input type="text" value={ctaConfig.btnLink} onChange={e => setCtaConfig({ ...ctaConfig, btnLink: e.target.value })} className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>Footer Note</label><input type="text" value={ctaConfig.footerNote} onChange={e => setCtaConfig({ ...ctaConfig, footerNote: e.target.value })} className={inputCls} /></div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => saveSection('landing_cta', ctaConfig)} disabled={saving} className={btnSaveCls}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save CTA Banner
                        </button>
                    </div>
                </div>
            )}

            {/* === FOOTER SECTION === */}
            {activeSection === 'footer' && (
                <div className={cardCls}>
                    <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-slate-500" /> Footer Section</h3>
                    <div><label className={labelCls}>Description</label><textarea value={footerConfig.description} onChange={e => setFooterConfig({ ...footerConfig, description: e.target.value })} className={textareaCls} /></div>
                    <div><label className={labelCls}>Support Email</label><input type="email" value={footerConfig.supportEmail} onChange={e => setFooterConfig({ ...footerConfig, supportEmail: e.target.value })} className={inputCls} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Product Links (one per line)</label>
                            <textarea value={footerConfig.productLinks.join('\n')} onChange={e => setFooterConfig({ ...footerConfig, productLinks: e.target.value.split('\n') })} className={textareaCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Company Links (one per line)</label>
                            <textarea value={footerConfig.companyLinks.join('\n')} onChange={e => setFooterConfig({ ...footerConfig, companyLinks: e.target.value.split('\n') })} className={textareaCls} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => saveSection('landing_footer', footerConfig)} disabled={saving} className={btnSaveCls}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Footer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// TURN SERVERS TAB (10/10 Premium)
// ==========================================
function TurnServersTab() {
    const { settings: initialSettings, isLoading: loading, mutate: refetchSettings } = useAdminSettings();
    const { trigger: saveSettings } = useAdminSettingsMutation();

    const [turnEnabled, setTurnEnabled] = useState(true);
    const [turnServers, setTurnServers] = useState([]);
    const [turnSecret, setTurnSecret] = useState('');
    const [turnTTL, setTurnTTL] = useState('86400');
    const [stunServers, setStunServers] = useState('');
    const [meteredApiKey, setMeteredApiKey] = useState('');
    const [bandwidthUsed, setBandwidthUsed] = useState(0);
    const [bandwidthLimit, setBandwidthLimit] = useState(20480);
    const [showSecret, setShowSecret] = useState(false);
    const [showMeteredKey, setShowMeteredKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [healthResults, setHealthResults] = useState({});
    const [testingAll, setTestingAll] = useState(false);
    const [showAndroidSnippet, setShowAndroidSnippet] = useState(false);
    const [fetchingMetered, setFetchingMetered] = useState(false);

    // Add server form
    const [newUrl, setNewUrl] = useState('');
    const [newTransport, setNewTransport] = useState('auto');
    const [newRegion, setNewRegion] = useState('Global');
    const [newPriority, setNewPriority] = useState(10);
    const [newUsername, setNewUsername] = useState('');
    const [newCredential, setNewCredential] = useState('');

    // Initialize from settings
    useEffect(() => {
        if (initialSettings && Object.keys(initialSettings).length > 0) {
            setTimeout(() => {
                setTurnEnabled(initialSettings.turn_enabled !== 'false');
                setTurnSecret(initialSettings.turn_secret || '');
                setTurnTTL(initialSettings.turn_credential_ttl || '86400');
                setMeteredApiKey(initialSettings.turn_metered_api_key || '');
                setBandwidthUsed(parseFloat(initialSettings.turn_bandwidth_used_mb || '0'));
                setBandwidthLimit(parseFloat(initialSettings.turn_bandwidth_limit_mb || '20480'));
                try {
                    setTurnServers(JSON.parse(initialSettings.turn_servers || '[]'));
                } catch { setTurnServers([]); }
                try {
                    const arr = JSON.parse(initialSettings.turn_stun_servers || '[]');
                    setStunServers(arr.join('\n'));
                } catch { setStunServers('stun:stun.l.google.com:19302'); }
            }, 0);
        }
    }, [initialSettings]);

    const save = async () => {
        setSaving(true);
        try {
            await saveSettings({
                method: 'PUT',
                body: {
                    turn_enabled: turnEnabled ? 'true' : 'false',
                    turn_servers: JSON.stringify(turnServers),
                    turn_secret: turnSecret,
                    turn_credential_ttl: turnTTL,
                    turn_stun_servers: JSON.stringify(stunServers.split('\n').map(s => s.trim()).filter(Boolean)),
                    turn_metered_api_key: meteredApiKey,
                    turn_bandwidth_used_mb: String(bandwidthUsed),
                    turn_bandwidth_limit_mb: String(bandwidthLimit),
                }
            });
            toast.success('TURN configuration saved successfully');
            refetchSettings();
        } catch (e) {
            toast.error(e.message || 'Failed to save TURN config');
        }
        setSaving(false);
    };

    const addServer = () => {
        if (!newUrl.trim()) { toast.error('Server URL is required'); return; }
        let url = newUrl.trim();
        if (newTransport !== 'auto' && !url.includes('?transport=')) {
            url += `?transport=${newTransport}`;
        }
        const server = {
            url,
            region: newRegion,
            priority: parseInt(newPriority) || 10,
            enabled: true,
            username: newUsername.trim() || undefined,
            credential: newCredential.trim() || undefined,
        };
        setTurnServers(prev => [...prev, server]);
        setShowAddModal(false);
        setNewUrl(''); setNewTransport('auto'); setNewRegion('Global'); setNewPriority(10); setNewUsername(''); setNewCredential('');
        toast.success('Server added — click Save to persist');
    };

    const removeServer = (idx) => {
        setTurnServers(prev => prev.filter((_, i) => i !== idx));
        toast.success('Server removed — click Save to persist');
    };

    const toggleServer = (idx) => {
        setTurnServers(prev => prev.map((s, i) => i === idx ? { ...s, enabled: !s.enabled } : s));
    };

    const moveServer = (idx, direction) => {
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= turnServers.length) return;
        const arr = [...turnServers];
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        // Update priorities
        arr.forEach((s, i) => s.priority = i + 1);
        setTurnServers(arr);
    };

    const testServer = async (url, idx) => {
        setHealthResults(prev => ({ ...prev, [idx]: { status: 'testing' } }));
        try {
            const res = await fetch('/api/admin/turn-health');
            if (res.ok) {
                const data = await res.json();
                const result = data.servers?.find(s => s.url === url);
                if (result) {
                    setHealthResults(prev => ({ ...prev, [idx]: result }));
                } else {
                    setHealthResults(prev => ({ ...prev, [idx]: { status: 'unreachable', error: 'Not found in test results' } }));
                }
            }
        } catch {
            setHealthResults(prev => ({ ...prev, [idx]: { status: 'unreachable', error: 'Network error' } }));
        }
    };

    const testAllServers = async () => {
        setTestingAll(true);
        try {
            const res = await fetch('/api/admin/turn-health');
            if (res.ok) {
                const data = await res.json();
                const map = {};
                data.servers?.forEach((r, i) => { map[i] = r; });
                setHealthResults(map);
            }
        } catch { toast.error('Health check failed'); }
        setTestingAll(false);
    };

    const fetchMeteredServers = async () => {
        if (!meteredApiKey) { toast.error('Enter your Metered.ca API key first'); return; }
        setFetchingMetered(true);
        try {
            const res = await fetch(`/api/turn-credentials`);
            if (res.ok) {
                const data = await res.json();
                if (data.source === 'metered' && data.iceServers?.length > 0) {
                    const newServers = data.iceServers
                        .filter(s => s.urls && String(s.urls).startsWith('turn'))
                        .map((s, i) => ({
                            url: Array.isArray(s.urls) ? s.urls[0] : s.urls,
                            username: s.username || '',
                            credential: s.credential || '',
                            region: 'Global',
                            priority: i + 1,
                            enabled: true,
                        }));
                    setTurnServers(newServers);
                    toast.success(`Fetched ${newServers.length} TURN servers from Metered.ca`);
                } else {
                    toast.warning('No TURN servers returned. Check your API key.');
                }
            }
        } catch { toast.error('Failed to fetch from Metered.ca'); }
        setFetchingMetered(false);
    };

    const bandwidthPercent = bandwidthLimit > 0 ? Math.min((bandwidthUsed / bandwidthLimit) * 100, 100) : 0;
    const bandwidthColor = bandwidthPercent > 80 ? 'text-red-500' : bandwidthPercent > 50 ? 'text-amber-500' : 'text-emerald-500';
    const enabledCount = turnServers.filter(s => s.enabled !== false).length;
    const disabledCount = turnServers.length - enabledCount;

    const healthDot = (idx) => {
        const r = healthResults[idx];
        if (!r) return null;
        if (r.status === 'testing') return <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />;
        if (r.status === 'healthy') return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" title={`${r.latencyMs}ms`} />;
        if (r.status === 'slow') return <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" title={`${r.latencyMs}ms (slow)`} />;
        return <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" title={r.error || 'Unreachable'} />;
    };

    const regionFlag = (region) => {
        const flags = { Bangladesh: '🇧🇩', UAE: '🇦🇪', KSA: '🇸🇦', UK: '🇬🇧', USA: '🇺🇸', Singapore: '🇸🇬', Global: '🌐' };
        return flags[region] || '🌐';
    };

    const protocolBadge = (url) => {
        if (!url) return 'TURN';
        if (url.startsWith('turns:')) return 'TURNS/TLS';
        if (url.includes('transport=tcp')) return 'TURN/TCP';
        return 'TURN/UDP';
    };

    const inputCls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition text-slate-800 dark:text-slate-200";
    const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5";

    if (loading) return <div className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin inline mr-2" />Loading TURN configuration...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
            {/* === HEADER === */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2"><Radio className="w-6 h-6 text-cyan-500" /> TURN Server Management</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Configure WebRTC relay servers for NAT traversal. Changes apply to all clients instantly.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button onClick={testAllServers} disabled={testingAll || turnServers.length === 0} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm disabled:opacity-50 w-full sm:w-auto">
                        {testingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />} Test All
                    </button>
                    <button onClick={save} disabled={saving} className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm shadow-cyan-500/20 disabled:opacity-50 w-full sm:w-auto">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Save Configuration
                    </button>
                </div>
            </div>

            {/* === STATUS BANNER === */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-2xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Global Toggle */}
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500 uppercase mb-2">TURN Relay</span>
                        <button onClick={() => setTurnEnabled(!turnEnabled)} className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${turnEnabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${turnEnabled ? 'translate-x-7' : 'translate-x-0.5'}`} />
                        </button>
                        <span className={`text-xs font-bold mt-1 ${turnEnabled ? 'text-cyan-600' : 'text-slate-400'}`}>{turnEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>

                    {/* Server counts */}
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Servers</span>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{turnServers.length}</span>
                            <div className="flex flex-col text-[10px] font-bold">
                                <span className="text-emerald-500">{enabledCount} active</span>
                                {disabledCount > 0 && <span className="text-slate-400">{disabledCount} disabled</span>}
                            </div>
                        </div>
                    </div>

                    {/* Bandwidth Gauge */}
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Bandwidth Used</span>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeDasharray={`${bandwidthPercent}, 100`} className={bandwidthColor} strokeLinecap="round" />
                                </svg>
                                <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-black ${bandwidthColor}`}>{Math.round(bandwidthPercent)}%</span>
                            </div>
                            <div className="text-xs">
                                <p className="font-bold text-slate-700 dark:text-slate-300">{(bandwidthUsed / 1024).toFixed(1)} GB</p>
                                <p className="text-slate-400">of {(bandwidthLimit / 1024).toFixed(0)} GB</p>
                            </div>
                        </div>
                    </div>

                    {/* Metered Status */}
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Metered.ca</span>
                        {meteredApiKey ? (
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Connected</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="text-sm font-medium text-slate-400">Not configured</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === TURN SERVER CARDS === */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold flex items-center gap-2"><Server className="w-5 h-5 text-cyan-500" /> TURN Servers ({turnServers.length})</h3>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm">
                        <Plus className="w-4 h-4" /> Add Server
                    </button>
                </div>

                {turnServers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Radio className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="font-bold text-slate-600 dark:text-slate-300">No TURN servers configured</p>
                        <p className="text-sm text-slate-400 mt-1">Add a server manually or connect your Metered.ca account below.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {turnServers.map((server, idx) => (
                            <div key={idx} className={`p-4 flex items-center gap-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/30 ${server.enabled === false ? 'opacity-50' : ''}`}>
                                {/* Priority arrows */}
                                <div className="flex flex-col gap-0.5">
                                    <button onClick={() => moveServer(idx, -1)} disabled={idx === 0} className="text-slate-400 hover:text-cyan-500 disabled:opacity-30 transition"><ChevronUp className="w-4 h-4" /></button>
                                    <span className="text-[10px] font-bold text-center text-slate-400">#{idx + 1}</span>
                                    <button onClick={() => moveServer(idx, 1)} disabled={idx === turnServers.length - 1} className="text-slate-400 hover:text-cyan-500 disabled:opacity-30 transition"><ChevronDown className="w-4 h-4" /></button>
                                </div>

                                {/* Health dot */}
                                <div className="w-5 flex justify-center">{healthDot(idx)}</div>

                                {/* Server info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate">{server.url}</span>
                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${server.url?.startsWith('turns:') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{protocolBadge(server.url)}</span>
                                        <span className="text-xs">{regionFlag(server.region)} {server.region || 'Global'}</span>
                                    </div>
                                    {server.username && <p className="text-xs text-slate-400 mt-0.5">Credentials: static (user: {server.username.slice(0, 8)}...)</p>}
                                    {!server.username && turnSecret && <p className="text-xs text-slate-400 mt-0.5">Credentials: HMAC (auto-generated)</p>}
                                    {healthResults[idx]?.latencyMs != null && <p className="text-xs text-slate-500 mt-0.5">Latency: {healthResults[idx].latencyMs}ms</p>}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button onClick={() => testServer(server.url, idx)} className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 px-3 py-1.5 rounded-lg transition border border-transparent">Test</button>
                                    <button onClick={() => toggleServer(idx)} className={`p-1.5 rounded-lg transition ${server.enabled !== false ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}>
                                        {server.enabled !== false ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => removeServer(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* === METERED.CA INTEGRATION === */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" /> Metered.ca Integration
                </h3>
                <p className="text-xs text-slate-500">Connect your free Metered.ca account to auto-provision TURN servers with 20GB/month free bandwidth. <a href="https://www.metered.ca/tools/openrelay/" target="_blank" rel="noopener" className="text-cyan-600 hover:underline">Get a free API key →</a></p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className={labelCls}>Metered.ca API Key</label>
                        <div className="relative">
                            <input type={showMeteredKey ? 'text' : 'password'} value={meteredApiKey} onChange={e => setMeteredApiKey(e.target.value)} className={inputCls} placeholder="Your Metered.ca API key" />
                            <button onClick={() => setShowMeteredKey(!showMeteredKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><Eye className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button onClick={fetchMeteredServers} disabled={fetchingMetered || !meteredApiKey} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm disabled:opacity-50">
                            {fetchingMetered ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Fetch Servers
                        </button>
                    </div>
                </div>
            </div>

            {/* === GLOBAL CREDENTIALS === */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" /> HMAC Credentials (Self-Hosted TURN)
                </h3>
                <p className="text-xs text-slate-500">For self-hosted TURN servers (coturn), set a shared secret to generate time-limited credentials. Clients receive auto-expiring credentials via the API.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Shared Secret</label>
                        <div className="relative">
                            <input type={showSecret ? 'text' : 'password'} value={turnSecret} onChange={e => setTurnSecret(e.target.value)} className={inputCls} placeholder="e.g. my-super-secret-key" />
                            <button onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><Eye className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Credential TTL</label>
                        <select value={turnTTL} onChange={e => setTurnTTL(e.target.value)} className={inputCls}>
                            <option value="3600">1 Hour</option>
                            <option value="21600">6 Hours</option>
                            <option value="86400">24 Hours (Default)</option>
                            <option value="604800">7 Days</option>
                        </select>
                    </div>
                </div>
                {turnSecret && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 mb-1">Preview: Clients will receive credentials like this:</p>
                        <code className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">username: &quot;[timestamp + TTL]&quot;  •  credential: &quot;[HMAC-SHA1 hash]&quot;</code>
                    </div>
                )}
            </div>

            {/* === STUN SERVERS === */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> STUN Servers</h3>
                    <button onClick={() => setStunServers('stun:stun.l.google.com:19302\nstun:stun1.l.google.com:19302\nstun:openrelay.metered.ca:80')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Reset to defaults</button>
                </div>
                <textarea value={stunServers} onChange={e => setStunServers(e.target.value)} rows={4} className={inputCls + ' font-mono text-xs'} placeholder="One STUN URL per line\nstun:stun.l.google.com:19302" />
            </div>

            {/* === CONNECTION QUALITY LEGEND === */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-emerald-500" /> Connection Quality Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-lg">🟢</span>
                        <div><p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Direct (P2P)</p><p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Best quality. Both devices can connect directly. No relay needed.</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <span className="text-lg">🔵</span>
                        <div><p className="font-bold text-sm text-blue-700 dark:text-blue-400">STUN (NAT Traversal)</p><p className="text-xs text-blue-600/70 dark:text-blue-400/70">Good quality. STUN helps devices behind NAT find each other.</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                        <span className="text-lg">🟡</span>
                        <div><p className="font-bold text-sm text-amber-700 dark:text-amber-400">TURN Relay</p><p className="text-xs text-amber-600/70 dark:text-amber-400/70">All traffic relayed through TURN server. Works behind strict firewalls but uses bandwidth quota.</p></div>
                    </div>
                </div>
            </div>

            {/* === ANDROID SNIPPET === */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <button onClick={() => setShowAndroidSnippet(!showAndroidSnippet)} className="w-full p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <h3 className="font-bold flex items-center gap-2"><Terminal className="w-5 h-5 text-slate-500" /> Android Integration Snippet</h3>
                    {showAndroidSnippet ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {showAndroidSnippet && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto relative">
                        <button onClick={() => { navigator.clipboard.writeText(androidSnippetText); toast.success('Copied!'); }} className="absolute top-2 right-2 text-slate-400 hover:text-white transition"><Copy className="w-4 h-4" /></button>
                        <pre>{androidSnippetText}</pre>
                    </div>
                )}
            </div>

            {/* === ADD SERVER MODAL === */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Plus className="w-5 h-5 text-cyan-500" /> Add TURN Server</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 transition"><XCircle className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className={labelCls}>Server URL <span className="text-red-500">*</span></label>
                                <input type="text" value={newUrl} onChange={e => setNewUrl(e.target.value)} className={inputCls} placeholder="turn:relay.metered.ca:80" />
                                <p className="text-[10px] text-slate-400 mt-1">Examples: turn:relay.example.com:3478 • turns:relay.example.com:443</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls}>Transport</label>
                                    <select value={newTransport} onChange={e => setNewTransport(e.target.value)} className={inputCls}>
                                        <option value="auto">Auto</option>
                                        <option value="udp">UDP</option>
                                        <option value="tcp">TCP</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Region</label>
                                    <select value={newRegion} onChange={e => setNewRegion(e.target.value)} className={inputCls}>
                                        <option>Global</option>
                                        <option>Bangladesh</option>
                                        <option>UAE</option>
                                        <option>KSA</option>
                                        <option>UK</option>
                                        <option>USA</option>
                                        <option>Singapore</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Priority</label>
                                    <input type="number" min="1" max="99" value={newPriority} onChange={e => setNewPriority(e.target.value)} className={inputCls} />
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-500 mb-2">Static Credentials (optional — leave blank for HMAC mode)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className={inputCls} placeholder="Username" />
                                    <input type="text" value={newCredential} onChange={e => setNewCredential(e.target.value)} className={inputCls} placeholder="Credential" />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-5 py-2 font-bold text-sm text-slate-600 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
                            <button onClick={addServer} disabled={!newUrl.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm disabled:opacity-50 transition flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Server
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const androidSnippetText = `// In WebRTCManager.kt — replace hardcoded iceServers with:
val iceServers = IceConfigFetcher(context).getIceServers()

// IceConfigFetcher.kt fetches from:
// GET {SERVER_URL}/api/turn-credentials
// Returns: { iceServers: [{ urls, username?, credential? }] }
// Cached for 1 hour in EncryptedSharedPreferences`;

// ==========================================
// SMALL UI COMPONENTS (unchanged)
// ==========================================

function NavItem({ icon, label, badge, isActive, onClick }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <div className="flex items-center gap-3">
                {React.cloneElement(icon, { className: 'w-5 h-5' })}
                <span className="font-medium text-sm">{label}</span>
            </div>
            {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-indigo-600' : 'bg-slate-700 text-slate-300'}`}>
                    {badge}
                </span>
            )}
        </button>
    );
}

function StatCard({ title, value, trend, isUp, icon, subtitle, isWarning }) {
    return (
        <div className={`bg-white dark:bg-slate-900 border ${isWarning ? 'border-amber-500/50 shadow-amber-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-5 shadow-sm`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</h3>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
            </div>
            <div className="flex items-end gap-3 mb-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{value}</h2>
                {isUp !== null && (
                    <span className={`flex items-center text-xs font-bold mb-1 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {trend}
                    </span>
                )}
                {isUp === null && <span className="text-xs font-bold text-slate-400 mb-1">{trend}</span>}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
        </div>
    );
}

function TicketRow({ title, user, time, status }) {
    const statusColors = {
        high: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        low: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    };
    return (
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group">
            <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{title}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{user}</span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${statusColors[status]}`}>{status}</span>
        </div>
    );
}

function ParentTableRow({ name, email, phone, ipLoc, childrenList, plan, status, expiry }) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
            <td className="px-6 py-4">
                <p className="font-bold text-slate-900 dark:text-white">{name}</p>
                <p className="text-xs text-slate-500">{email}</p>
                <p className="text-xs text-slate-400">{phone}</p>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                    <GlobeIcon className="w-3 h-3" /> {ipLoc}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="space-y-1.5">
                    {childrenList.map((child, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${child.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{child.name}</span>
                            <span className="text-xs text-slate-500">({child.phone})</span>
                        </div>
                    ))}
                    {childrenList.length === 0 && <span className="text-xs text-slate-400">No children</span>}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col items-start gap-1">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'}`}>
                        {status.toUpperCase()}
                    </span>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{plan}</p>
                    <p className="text-[10px] text-slate-400">Exp: {expiry}</p>
                </div>
            </td>
            <td className="px-6 py-4 text-right relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition">
                    <MoreVertical className="w-5 h-5" />
                </button>
                {menuOpen && (
                    <div className="absolute right-6 top-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 py-1 w-40" onMouseLeave={() => setMenuOpen(false)}>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">View Details</button>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 font-medium">Suspend</button>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 font-medium">Delete</button>
                    </div>
                )}
            </td>
        </tr>
    );
}

function TrxRow({ id, gateway, email, amount, status, time, isFail }) {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
            <td className="px-6 py-4 font-mono text-xs text-slate-500">{id}</td>
            <td className="px-6 py-4">
                <span className={`font-bold text-xs px-2 py-1 rounded ${gateway === 'bKash' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' : gateway === 'Nagad' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                    {gateway}
                </span>
            </td>
            <td className="px-6 py-4 text-sm font-medium">{email}</td>
            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{amount}</td>
            <td className="px-6 py-4">
                <span className={`flex items-center gap-1 text-xs font-bold ${isFail ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isFail ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} {status}
                </span>
            </td>
            <td className="px-6 py-4 text-xs text-slate-500">{time}</td>
        </tr>
    );
}

function FilterPill({ label, type, onDelete }) {
    return (
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{label}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">{type}</span>
            </div>
            <button onClick={onDelete} className="text-slate-400 hover:text-red-500 transition">
                <XCircle className="w-4 h-4" />
            </button>
        </div>
    );
}

function GlobeIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    );
}
