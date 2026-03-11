"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { toast } from 'sonner';
import { useAdminStats, useAdminParents, useAdminTransactions, useAdminFilters, useAdminDevices, useAdminTickets, useAdminAnalytics, useAdminSettings, useAdminSettingsMutation, useAdminLandingConfig, useAdminLandingConfigMutation } from '@/hooks/useApi';
import {
    LayoutDashboard, Users, CreditCard, Smartphone, LifeBuoy,
    ShieldAlert, BarChart3, UploadCloud, Search, Bell, Settings,
    MoreVertical, ArrowUpRight, ArrowDownRight, MapPin, CheckCircle,
    XCircle, Clock, Download, Plus, Terminal, AlertTriangle,
    Filter, UserPlus, LogOut, Loader2,
    Map, RefreshCcw, FileText, Send, HardDrive, DollarSign, Mail, Database, SmartphoneCharging, Play, Pause, Server, Globe, Trash2, GripVertical, Eye, Type, Star, MessageSquare, Zap
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminPage() {
    const t = useTranslations('Admin');
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const userName = session?.user?.name || 'Admin';
    const userEmail = session?.user?.email || '';
    const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex transition-colors duration-200">

            {/* --- SIDEBAR --- */}
            <aside className="w-64 fixed top-0 left-0 bottom-0 bg-slate-900 dark:bg-slate-900 text-slate-300 shadow-2xl z-50 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 bg-slate-950/50 border-b border-slate-800">
                    <ShieldAlert className="w-6 h-6 text-emerald-500 mr-3" />
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tight leading-tight">PG Admin Hub</h1>
                        <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">PoribarGuard BD</p>
                    </div>
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
                    <NavItem icon={<LayoutDashboard />} label={t('dashboard')} isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={<Users />} label={t('parents')} isActive={activeTab === 'parents'} onClick={() => setActiveTab('parents')} />
                    <NavItem icon={<CreditCard />} label={t('billing')} isActive={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                    <NavItem icon={<Smartphone />} label={t('devices')} isActive={activeTab === 'devices'} onClick={() => setActiveTab('devices')} />
                    <NavItem icon={<LifeBuoy />} label={t('support')} isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                    <NavItem icon={<ShieldAlert />} label={t('filters')} isActive={activeTab === 'filters'} onClick={() => setActiveTab('filters')} />
                    <NavItem icon={<BarChart3 />} label={t('analytics')} isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <NavItem icon={<UploadCloud />} label={t('apk')} isActive={activeTab === 'apk'} onClick={() => setActiveTab('apk')} />
                    <NavItem icon={<Globe />} label="Landing Page" isActive={activeTab === 'landing'} onClick={() => setActiveTab('landing')} />
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-1">
                    <NavItem icon={<Settings />} label={t('settings')} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">{t('logOut')}</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">

                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-96 border border-slate-200 dark:border-slate-700">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input type="text" placeholder={t('searchPlaceholder')} className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">⌘K</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition">
                            <Terminal className="w-4 h-4" /> System Status: Normal
                        </button>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                        <ThemeToggle />
                        <button className="relative text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-x-hidden">
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'parents' && <ParentsTab searchQuery={searchQuery} />}
                    {activeTab === 'billing' && <BillingTab />}
                    {activeTab === 'filters' && <FiltersTab />}
                    {activeTab === 'devices' && <DevicesTab />}
                    {activeTab === 'support' && <SupportTab />}
                    {activeTab === 'analytics' && <AnalyticsTab />}
                    {activeTab === 'apk' && <ApkTab />}
                    {activeTab === 'landing' && <LandingConfigTab />}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Full Name *</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
                                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Phone Number *</label><input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
                            </div>
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Email Address *</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Password *</label><input type="password" required minLength="6" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
                            <div className="grid grid-cols-2 gap-4">
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
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm shadow-emerald-500/30">
                        <UserPlus className="w-4 h-4" /> Add Parent
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    useEffect(() => { setPage(1); }, [searchQuery]);

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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Parents & Families Directory</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {!loading ? `${pagination.total} registered families` : 'Loading...'}
                    </p>
                </div>
                <button onClick={exportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2">
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
                                    children={p.children.map(c => ({
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Global Content Filters (BD Region)</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage blacklists and keyword alerts pushed to all child devices.</p>
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-2">
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Device Grid & Map</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Live view of {devices.length} connected devices</p>
                </div>
                <button onClick={fetchDevices} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2">
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

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Generate Custom Report</h3>
                    <p className="text-sm text-slate-500 mt-1">Export detailed DB dumps in CSV or PDF formats.</p>
                </div>
                <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition hover:opacity-90">
                    <Download className="w-4 h-4" /> Download Dump
                </button>
            </div>
        </div>
    );
}

// ==========================================
// APK MANAGEMENT TAB (UI Only)
// ==========================================
function ApkTab() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold">APK Management & OTA Updates</h2>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-left w-full">
                    <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-400 mb-2">Current Production Version (Child App)</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">Version: <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded ml-1 border border-indigo-100 dark:border-indigo-700">v2.1.4 (Build 42)</span></p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Uploaded: <span className="font-semibold">2 days ago</span></p>
                </div>
                <button className="whitespace-nowrap w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                    <UploadCloud className="w-5 h-5" /> Upload New Build
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
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
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4">
                                <p className="font-bold text-slate-900 dark:text-white">v2.1.4</p>
                                <p className="text-xs text-slate-500">Build 42 • Target SDK 34</p>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium">14.2 MB</td>
                            <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-[10px] tracking-wider font-extrabold rounded">LIVE (PRODUCTION)</span></td>
                            <td className="px-6 py-4 text-slate-500 text-xs">Oct 12, 2024</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-indigo-500 dark:text-indigo-400 font-bold text-xs bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded disabled:opacity-50 cursor-default border border-transparent">Active</button>
                            </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4">
                                <p className="font-bold text-slate-900 dark:text-white">v2.1.3</p>
                                <p className="text-xs text-slate-500">Build 41 • Target SDK 33</p>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium">13.8 MB</td>
                            <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[10px] tracking-wider font-extrabold rounded">ARCHIVED</span></td>
                            <td className="px-6 py-4 text-slate-500 text-xs">Sep 28, 2024</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-slate-600 dark:text-slate-400 font-bold text-xs border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition">Restore</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
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
            setSettings(initialSettings);
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
                trustBadges: ['Trusted by 2,347+ BD families', '100% Legal', 'bKash/Nagad Accepted']
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
                tiers: [
                    { name: 'Standard', price: '৳299', desc: 'Basic safety for one child', features: ['Live Location Tracking', 'Geofence Alerts (School/Home)', 'Daily Screen Time Reports', 'SOS Button Access'], isPopular: false, btnText: 'Start Free Trial' },
                    { name: 'Premium', price: '৳599', desc: 'Most Popular! Best for ultimate peace of mind.', features: ['Everything in Standard', 'Live Camera & Mic On-Demand', 'Live Screen Viewing', 'Prayer Time Auto-Lock', 'App Blocking (TikTok, FreeFire)'], isPopular: true, btnText: 'Start 7-Day Free Trial' },
                    { name: 'Ultimate', price: '৳899', desc: 'For multiple children & strict control', features: ['Everything in Premium', 'Device Owner Mode (Uninstall block)', 'Remote Wipe Data', 'Priority 24/7 Phone Support', 'Up to 3 Children'], isPopular: false, btnText: 'Start Free Trial' }
                ]
            });
            setFaqConfig(landingConfig.landing_faq || {
                sectionTitle: 'Frequently Asked Questions',
                faqs: [
                    { q: 'Is it completely legal to install this app?', a: 'Yes. In Bangladesh, as a parent or legal guardian, it is completely legal to monitor the devices of your minor children (under 18) for their safety and digital wellbeing.' },
                    { q: 'আমি কি প্রবাস থেকে এটি সেটআপ করতে পারব?', a: 'জি, ১০০%। আপনি শুধু আমাদের Magic SMS লিঙ্কটি সন্তানের ফোনে পাঠাবেন।' },
                    { q: 'Can the child uninstall the PoribarGuard app?', a: 'If you subscribe to the Ultimate plan, you can enable Device Owner Mode.' },
                    { q: 'গ্রামের বাজে ইন্টারনেট স্পিডে কি এটা কাজ করবে?', a: 'হ্যাঁ। লোকেশন এবং ছোট টেক্সট অ্যালার্টগুলো 2G/3G নেটওয়ার্কেও কাজ করবে।' },
                    { q: 'How does the Prayer Time Auto Lock work?', a: 'The system syncs with local Bangladesh prayer times.' }
                ]
            });
            setTestimonialsConfig(landingConfig.landing_testimonials || {
                sectionTitle: 'যারা ইতিমধ্যে ব্যবহার করছেন',
                statBadge: '2,347+ Probashi Families Protected',
                testimonials: [
                    { name: 'Rahim Chowdhury', location: '🇦🇪 Dubai, UAE', text: 'ভাই, এটা আসলেই ম্যাজিক।', rating: 5, imgUrl: 'https://i.pravatar.cc/150?img=11' },
                    { name: 'Fatema Begum', location: '🇸🇦 Riyadh, KSA', text: 'প্রথম দিকে ভাবছিলাম কীভাবে সেটআপ করব...', rating: 5, imgUrl: 'https://i.pravatar.cc/150?img=5' },
                    { name: 'Kamrul Hasan', location: '🇬🇧 London, UK', text: 'The auto-lock feature is exactly what we needed.', rating: 5, imgUrl: 'https://i.pravatar.cc/150?img=12' }
                ],
                featuredLogos: ['Prothom Alo', 'Daily Star', 'Probashi FB Groups', 'Somoy TV']
            });
            setHowItWorksConfig(landingConfig.landing_howitworks || {
                sectionTitle: '৩ মিনিটে শুরু করুন',
                sectionSubtitle: 'No technical skills needed. Setup from anywhere in the world.',
                steps: [
                    { title: 'Sign Up & Pay', desc: 'Create account securely using bKash, Nagad, or International Cards.' },
                    { title: 'Send Magic Link', desc: 'Send the custom SMS link to child. It auto-installs in stealth mode.' },
                    { title: 'Monitor Silently', desc: 'Open dashboard from Dubai, London, or Riyadh. Start tracking.' }
                ]
            });
            setCtaConfig(landingConfig.landing_cta || {
                heading: 'আজই শুরু করুন —',
                subheading: 'আপনার সন্তানের নিরাপত্তা আপনার হাতে',
                btnText: 'Get Started Free',
                btnLink: '/register',
                footerNote: 'No credit card required for 7-day trial.'
            });
            setFooterConfig(landingConfig.landing_footer || {
                description: 'Bringing peace of mind to Bangladeshi expatriates worldwide.',
                supportEmail: 'support@poribarguardbd.com',
                productLinks: ['Features', 'Pricing', 'How it Works', 'Download Test APK'],
                companyLinks: ['About Us', 'Privacy Policy (for Minors)', 'Terms of Service']
            });
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
                                    <div className="grid grid-cols-2 gap-3">
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

                    <div>
                        <label className={labelCls}>Pricing Tiers</label>
                        <div className="space-y-4">
                            {pricingConfig.tiers.map((tier, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400">Tier #{idx + 1} {tier.isPopular && <span className="text-emerald-500">★ Popular</span>}</span>
                                        <button onClick={() => { const t = pricingConfig.tiers.filter((_, i) => i !== idx); setPricingConfig({ ...pricingConfig, tiers: t }); }} className={btnRemoveCls}><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <input type="text" value={tier.name} onChange={e => { const t = [...pricingConfig.tiers]; t[idx] = { ...t[idx], name: e.target.value }; setPricingConfig({ ...pricingConfig, tiers: t }); }} className={inputCls} placeholder="Plan Name" />
                                        <input type="text" value={tier.price} onChange={e => { const t = [...pricingConfig.tiers]; t[idx] = { ...t[idx], price: e.target.value }; setPricingConfig({ ...pricingConfig, tiers: t }); }} className={inputCls} placeholder="Price (e.g. ৳299)" />
                                        <input type="text" value={tier.btnText} onChange={e => { const t = [...pricingConfig.tiers]; t[idx] = { ...t[idx], btnText: e.target.value }; setPricingConfig({ ...pricingConfig, tiers: t }); }} className={inputCls} placeholder="Button Text" />
                                    </div>
                                    <input type="text" value={tier.desc} onChange={e => { const t = [...pricingConfig.tiers]; t[idx] = { ...t[idx], desc: e.target.value }; setPricingConfig({ ...pricingConfig, tiers: t }); }} className={inputCls} placeholder="Description" />
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={tier.isPopular} onChange={e => { const t = [...pricingConfig.tiers]; t[idx] = { ...t[idx], isPopular: e.target.checked }; setPricingConfig({ ...pricingConfig, tiers: t }); }} className="rounded" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Mark as Popular</span>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Features (one per line)</label>
                                        <textarea value={tier.features.join('\n')} onChange={e => { const t = [...pricingConfig.tiers]; t[idx] = { ...t[idx], features: e.target.value.split('\n') }; setPricingConfig({ ...pricingConfig, tiers: t }); }} className={textareaCls} placeholder="One feature per line" />
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setPricingConfig({ ...pricingConfig, tiers: [...pricingConfig.tiers, { name: '', price: '', desc: '', features: [], isPopular: false, btnText: 'Start Free Trial' }] })} className={btnAddCls}><Plus className="w-4 h-4" /> Add Tier</button>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => saveSection('landing_pricing', pricingConfig)} disabled={saving} className={btnSaveCls}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Pricing
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
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" value={t.name} onChange={e => { const ts = [...testimonialsConfig.testimonials]; ts[idx] = { ...ts[idx], name: e.target.value }; setTestimonialsConfig({ ...testimonialsConfig, testimonials: ts }); }} className={inputCls} placeholder="Name" />
                                        <input type="text" value={t.location} onChange={e => { const ts = [...testimonialsConfig.testimonials]; ts[idx] = { ...ts[idx], location: e.target.value }; setTestimonialsConfig({ ...testimonialsConfig, testimonials: ts }); }} className={inputCls} placeholder="Location (e.g. 🇦🇪 Dubai)" />
                                    </div>
                                    <textarea value={t.text} onChange={e => { const ts = [...testimonialsConfig.testimonials]; ts[idx] = { ...ts[idx], text: e.target.value }; setTestimonialsConfig({ ...testimonialsConfig, testimonials: ts }); }} className={textareaCls} placeholder="Review text" />
                                    <div className="grid grid-cols-2 gap-3">
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

function ParentTableRow({ name, email, phone, ipLoc, children, plan, status, expiry }) {
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
                    {children.map((child, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${child.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{child.name}</span>
                            <span className="text-xs text-slate-500">({child.phone})</span>
                        </div>
                    ))}
                    {children.length === 0 && <span className="text-xs text-slate-400">No children</span>}
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
