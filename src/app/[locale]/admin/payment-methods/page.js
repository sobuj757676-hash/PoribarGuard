"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Save, X, Eye } from 'lucide-react';
import Image from 'next/image';

export default function AdminPaymentMethodsTab() {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', type: 'Manual', logoUrl: '', instructions: '', phoneNumber: '', status: 'Active', priorityOrder: 0 });

    const fetchMethods = async () => {
        try {
            const res = await fetch('/api/admin/payment-methods');
            if (res.ok) {
                const data = await res.json();
                setMethods(data);
            }
        } catch (error) {
            toast.error("Failed to fetch payment methods");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const url = formData.id ? `/api/admin/payment-methods/${formData.id}` : '/api/admin/payment-methods';
            const method = formData.id ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`Payment method ${formData.id ? 'updated' : 'created'} successfully`);
                setIsEditing(false);
                fetchMethods();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to save payment method");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this payment method?")) return;
        try {
            const res = await fetch(`/api/admin/payment-methods/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Payment method deleted");
                fetchMethods();
            } else {
                toast.error("Failed to delete payment method");
            }
        } catch (error) {
            toast.error("An error occurred while deleting");
        }
    };

    const openCreateModal = () => {
        setFormData({ id: '', name: '', type: 'Manual', logoUrl: '', instructions: '', phoneNumber: '', status: 'Active', priorityOrder: methods.length + 1 });
        setIsEditing(true);
    };

    const openEditModal = (method) => {
        setFormData(method);
        setIsEditing(true);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading payment methods...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Methods</h2>
                    <p className="text-sm text-slate-500">Manage online and manual payment gateways for checkout.</p>
                </div>
                <button onClick={openCreateModal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors">
                    <Plus className="w-5 h-5" /> Add Method
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {methods.map(method => (
                    <div key={method.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    {method.logoUrl ? (
                                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700">
                                            <Image src={method.logoUrl} alt={method.name} width={32} height={32} className="object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                            <span className="text-slate-400 font-bold">{method.name.substring(0, 2).toUpperCase()}</span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{method.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{method.type}</span>
                                            {method.status === 'Active' ? (
                                                <span className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>
                                            ) : (
                                                <span className="text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactive</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {method.type === 'Manual' && (
                                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <span className="text-xs text-slate-500 block mb-1">Phone Number</span>
                                        <p className="font-medium text-slate-900 dark:text-white">{method.phoneNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block mb-1">Instructions</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2" title={method.instructions}>{method.instructions || 'N/A'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-xs text-slate-500">Priority: {method.priorityOrder}</span>
                            <div className="flex gap-2">
                                <button onClick={() => openEditModal(method)} className="p-2 text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(method.id)} className="p-2 text-slate-500 hover:text-rose-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
                        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.id ? 'Edit' : 'Add'} Payment Method</h3>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name *</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white" placeholder="e.g. bKash" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type *</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white">
                                        <option value="Manual">Manual</option>
                                        <option value="Online">Online</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Priority Order</label>
                                    <input type="number" required value={formData.priorityOrder} onChange={e => setFormData({ ...formData, priorityOrder: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Logo URL</label>
                                <input type="text" value={formData.logoUrl} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white" placeholder="/logos/bkash.svg or https://..." />
                            </div>

                            {formData.type === 'Manual' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone/Merchant Number</label>
                                        <input type="text" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white" placeholder="017XXXXXX" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Instructions (HTML allowed)</label>
                                        <textarea rows="4" value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-mono text-sm" placeholder="<p>Send money to...</p>"></textarea>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                    <Save className="w-4 h-4" /> Save Method
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
