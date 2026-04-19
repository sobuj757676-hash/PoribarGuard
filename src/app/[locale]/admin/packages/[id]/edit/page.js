"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

const AVAILABLE_FEATURES = [
    { id: 'app_blocking', label: 'App Blocking' },
    { id: 'geofencing', label: 'Geofencing' },
    { id: 'prayer_lock', label: 'Prayer Lock' },
    { id: 'location_tracking', label: 'Live Location Tracking' },
    { id: 'web_filtering', label: 'Web Filtering' }
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
        isActive: true
    });
    const [selectedFeatures, setSelectedFeatures] = useState([]);
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
                            isActive: pkg.isActive
                        });
                        try {
                            setSelectedFeatures(JSON.parse(pkg.features));
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
            const res = await fetch(`/api/admin/packages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    features: JSON.stringify(selectedFeatures)
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
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Package Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" rows="3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Monthly Price (BDT)</label>
                        <input required type="number" step="0.01" value={formData.priceMonthly} onChange={e => setFormData({...formData, priceMonthly: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Yearly Price (BDT) [Optional]</label>
                        <input type="number" step="0.01" value={formData.priceYearly} onChange={e => setFormData({...formData, priceYearly: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Included Features</label>
                    <div className="space-y-2">
                        {AVAILABLE_FEATURES.map(f => (
                            <label key={f.id} className="flex items-center space-x-2">
                                <input type="checkbox" checked={selectedFeatures.includes(f.id)} onChange={() => handleFeatureToggle(f.id)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                                <span>{f.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm font-medium">Package is Active</span>
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
