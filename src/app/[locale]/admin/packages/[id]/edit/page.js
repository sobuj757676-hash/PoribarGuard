"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

const AVAILABLE_FEATURES = [
    { id: 'app_blocking', label: 'App Blocking' },
    { id: 'geofencing', label: 'Geofencing' },
    { id: 'prayer_lock', label: 'Prayer Lock' },
    { id: 'location_tracking', label: 'Live Location Tracking' },
    { id: 'web_filtering', label: 'Web Filtering' },
    { id: 'live_camera', label: 'Live Camera (Front/Back)' },
    { id: 'live_mic', label: 'Live Ambient Mic' },
    { id: 'live_screen', label: 'Live Screen Mirroring' },
    { id: 'message_sync', label: 'Live Messaging Sync' },
    { id: 'activity_feed', label: 'Activity Feed & Alerts' },
    { id: 'reports', label: 'Weekly Reports' }
];

export default function EditPackagePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priceMonthly: '',
        priceYearly: '',
        isActive: true,
        isPopular: false,
        btnText: 'Start Free Trial'
    });
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [customFeatures, setCustomFeatures] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchPackage = async () => {
            try {
                const res = await fetch('/api/admin/packages');
                if (res.ok) {
                    const packages = await res.json();
                    const pkg = packages.find(p => p.id === id);
                    if (pkg) {
                        setFormData({
                            name: pkg.name,
                            description: pkg.description || '',
                            priceMonthly: pkg.priceMonthly,
                            priceYearly: pkg.priceYearly || '',
                            isActive: pkg.isActive,
                            isPopular: pkg.isPopular,
                            btnText: pkg.btnText || 'Start Free Trial'
                        });
                        try {
                            const parsedFeatures = JSON.parse(pkg.features);
                            if (Array.isArray(parsedFeatures)) {
                                setSelectedFeatures(parsedFeatures);
                            }
                        } catch(e) {}
                        try {
                            const displayFeatures = JSON.parse(pkg.displayFeatures || '[]');
                            if (Array.isArray(displayFeatures)) {
                                setCustomFeatures(displayFeatures.join('\n'));
                            }
                        } catch(e) {}
                    }
                }
            } catch (error) {
                toast.error("Failed to fetch package details");
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [id]);

    const handleFeatureToggle = (featureId) => {
        setSelectedFeatures(prev =>
            prev.includes(featureId)
                ? prev.filter(id => id !== featureId)
                : [...prev, featureId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const displayFeaturesArray = customFeatures.split('\n').map(f => f.trim()).filter(f => f);

            const res = await fetch(`/api/admin/packages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    features: JSON.stringify(selectedFeatures),
                    displayFeatures: JSON.stringify(displayFeaturesArray)
                })
            });

            if (res.ok) {
                toast.success('Package updated successfully');
                router.push('/en/admin/packages');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update package');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Subscription Package</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Package Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-800 dark:text-slate-200" rows="3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Monthly Price (BDT)</label>
                        <input required type="number" step="0.01" value={formData.priceMonthly} onChange={e => setFormData({...formData, priceMonthly: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Yearly Price (BDT) [Optional]</label>
                        <input type="number" step="0.01" value={formData.priceYearly} onChange={e => setFormData({...formData, priceYearly: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-800 dark:text-slate-200" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 mb-3">System Features (Permissions)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {AVAILABLE_FEATURES.map(f => (
                            <label key={f.id} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                                <input type="checkbox" checked={selectedFeatures.includes(f.id)} onChange={() => handleFeatureToggle(f.id)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{f.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Button Text</label>
                        <input type="text" value={formData.btnText} onChange={e => setFormData({...formData, btnText: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-800 dark:text-slate-200" placeholder="e.g. Start Free Trial" />
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isPopular} onChange={e => setFormData({...formData, isPopular: e.target.checked})} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Mark as Most Popular</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Landing Page Features (one per line)</label>
                    <textarea value={customFeatures} onChange={e => setCustomFeatures(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-800 dark:text-slate-200" rows="5" placeholder="Live Location Tracking&#10;Live Screen Viewing" />
                    <p className="text-xs text-slate-500 mt-2">These are the custom text features that will be shown on the pricing cards.</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Active Status</p>
                        <p className="text-xs text-slate-500">Enable or disable this package from being purchased.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                    </label>
                </div>

                <div className="pt-4 flex justify-end space-x-4">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Update Package'}
                    </button>
                </div>
            </form>
        </div>
    );
}
