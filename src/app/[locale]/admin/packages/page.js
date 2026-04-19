"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPackagesPage() {
    const { data: session } = useSession();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/admin/packages');
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            } else {
                toast.error("Failed to fetch packages");
            }
        } catch (error) {
            toast.error("Error fetching packages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            fetchPackages();
        }
    }, [session]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Package deleted successfully");
                fetchPackages();
            } else {
                toast.error("Failed to delete package");
            }
        } catch (error) {
            toast.error("Error deleting package");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Subscription Packages</h1>
                <Link href="/en/admin/packages/create" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Package
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="p-4 font-semibold text-sm">Name</th>
                            <th className="p-4 font-semibold text-sm">Price (Monthly)</th>
                            <th className="p-4 font-semibold text-sm">Features</th>
                            <th className="p-4 font-semibold text-sm">Status</th>
                            <th className="p-4 font-semibold text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.map((pkg) => {
                            let featuresList = [];
                            try {
                                featuresList = JSON.parse(pkg.features);
                            } catch (e) { }

                            return (
                                <tr key={pkg.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="p-4 font-medium">{pkg.name}</td>
                                    <td className="p-4">৳{pkg.priceMonthly}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1 max-w-sm whitespace-normal">
                                            {Array.isArray(featuresList) && featuresList.map(f => (
                                                <span key={f} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                                                    {f.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {pkg.isActive ? (
                                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full w-fit">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full w-fit">
                                                <XCircle className="w-3 h-3 mr-1" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <Link href={`/en/admin/packages/${pkg.id}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(pkg.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {packages.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">No packages found. Create one to get started.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
