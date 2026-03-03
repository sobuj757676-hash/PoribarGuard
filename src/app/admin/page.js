"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
    LayoutDashboard, Users, CreditCard, Smartphone, LifeBuoy,
    ShieldAlert, BarChart3, UploadCloud, Search, Bell, Settings,
    MoreVertical, ArrowUpRight, ArrowDownRight, MapPin, CheckCircle,
    XCircle, Clock, Download, Plus, Terminal, AlertTriangle,
    Moon, Sun, Filter, UserPlus, LogOut, Loader2,
    Map, RefreshCcw, FileText, Send, HardDrive, DollarSign, Mail, Database, SmartphoneCharging, Play, Pause, Server
} from 'lucide-react';

export default function AdminPage() {
    const { data: session } = useSession();
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
                    <NavItem icon={<LayoutDashboard />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={<Users />} label="Parents & Families" isActive={activeTab === 'parents'} onClick={() => setActiveTab('parents')} />
                    <NavItem icon={<CreditCard />} label="Billing & Subscriptions" isActive={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                    <NavItem icon={<Smartphone />} label="Device Grid & Map" isActive={activeTab === 'devices'} onClick={() => setActiveTab('devices')} />
                    <NavItem icon={<LifeBuoy />} label="Support Tickets" isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                    <NavItem icon={<ShieldAlert />} label="Content Filters" isActive={activeTab === 'filters'} onClick={() => setActiveTab('filters')} />
                    <NavItem icon={<BarChart3 />} label="Analytics & Reports" isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <NavItem icon={<UploadCloud />} label="APK Management" isActive={activeTab === 'apk'} onClick={() => setActiveTab('apk')} />
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-1">
                    <NavItem icon={<Settings />} label="System Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">

                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-96 border border-slate-200 dark:border-slate-700">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input type="text" placeholder="Search parent email, child phone, device ID..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">⌘K</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition">
                            <Terminal className="w-4 h-4" /> System Status: Normal
                        </button>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                        <button onClick={toggleTheme} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', country: '', city: '', plan: 'TRIAL' });

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => { setError('Failed to load stats'); setLoading(false); });
    }, []);

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
                alert(err.error || 'Failed to add parent');
            } else {
                alert('Parent account created successfully!');
                setShowModal(false);
                setFormData({ name: '', email: '', password: '', phone: '', country: '', city: '', plan: 'TRIAL' });
            }
        } catch (err) { alert('An error occurred'); }
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

    if (error) return <div className="text-red-500 text-center py-20">{error}</div>;

    const { stats, recentTickets } = data;

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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchParents = useCallback((p, search) => {
        setLoading(true);
        const params = new URLSearchParams({ page: p, limit: 10 });
        if (search) params.set('search', search);
        fetch(`/api/admin/parents?${params}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { setPage(1); }, [searchQuery]);
    useEffect(() => { fetchParents(page, searchQuery); }, [page, searchQuery, fetchParents]);

    const exportCSV = () => {
        if (!data?.parents) return;
        const header = 'Name,Email,Phone,Country,City,Plan,Status,Children';
        const rows = data.parents.map(p =>
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
                        {data ? `${data.pagination.total} registered families` : 'Loading...'}
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
                            ) : data?.parents?.map(p => (
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
                {data && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
                        <span>Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.pagination.total)} of {data.pagination.total}</span>
                        <div className="flex gap-1">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Prev</button>
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded">{page}</span>
                            <button disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Next</button>
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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/transactions')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

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
                ) : (data?.gatewayStats || []).map(g => (
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
                        ) : (data?.transactions || []).map(tx => (
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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newDomain, setNewDomain] = useState('');
    const [newKeyword, setNewKeyword] = useState('');

    const fetchFilters = useCallback(() => {
        fetch('/api/admin/filters')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchFilters(); }, [fetchFilters]);

    const addFilter = async (type) => {
        const pattern = type === 'DOMAIN' ? newDomain.trim() : newKeyword.trim();
        if (!pattern) return;
        const category = type === 'DOMAIN' ? 'Custom' : 'Custom';
        await fetch('/api/admin/filters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pattern, type, category }),
        });
        type === 'DOMAIN' ? setNewDomain('') : setNewKeyword('');
        fetchFilters();
    };

    const deleteFilter = async (id) => {
        await fetch('/api/admin/filters', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        fetchFilters();
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
                        <AlertTriangle className="w-5 h-5 text-red-500" /> Banned Domains ({data?.domains?.length || 0})
                    </h3>
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                        {(data?.domains || []).map(f => (
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
                        <Bell className="w-5 h-5 text-amber-500" /> Keyword Alerts ({data?.keywords?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Triggers urgent alert to parent if detected in SMS, WhatsApp, or Messenger.</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(data?.keywords || []).map(f => (
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
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDevices = useCallback(() => {
        setLoading(true);
        fetch('/api/admin/devices').then(r => r.json()).then(d => {
            setDevices(d.devices || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchDevices(); }, [fetchDevices]);

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
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('OPEN');
    const [selected, setSelected] = useState(null);

    const fetchTickets = useCallback((status) => {
        setLoading(true);
        fetch(`/api/admin/tickets?status=${status}`).then(r => r.json()).then(d => {
            setTickets(d.tickets || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchTickets(filter); }, [filter, fetchTickets]);

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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics').then(r => r.json()).then(d => {
            setData(d);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

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
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/admin/settings').then(r => r.json()).then(d => {
            setSettings(d.settings || {});
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

    const save = async () => {
        setSaving(true); setMsg('');
        const res = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        const d = await res.json();
        setSaving(false);
        setMsg(res.ok ? '✅ Settings saved!' : `❌ ${d.error}`);
        setTimeout(() => setMsg(''), 3000);
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
