import React, { useState } from 'react';
import { CreditCard, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminPackages } from '@/hooks/useApi';

export default function SubscriptionCard({ parentId, subscription, locale, mutate, parentMutation }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { packages } = useAdminPackages();

    const [formData, setFormData] = useState({
        packageId: subscription?.packageId || (subscription?.plan === 'TRIAL' ? 'TRIAL' : ''),
        status: subscription?.status || 'ACTIVE',
        endDate: subscription?.endDate ? new Date(subscription.endDate).toISOString().split('T')[0] : ''
    });

    // Determine fallback plan string for display if packageId isn't resolved
    const currentPlanDisplay = subscription?.package?.name || subscription?.plan || 'UNKNOWN';

    const isExpired = subscription && new Date(subscription.endDate) < new Date();
    const displayStatus = isExpired ? 'EXPIRED' : subscription?.status;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await parentMutation({
                method: 'PATCH',
                body: { subscriptionUpdate: formData }
            });
            toast.success("Subscription updated successfully");
            mutate();
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.message || "Failed to update subscription");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-emerald-500" />
                        Subscription
                    </h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1"
                        title="Manage Subscription"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    {subscription ? (
                        <>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Plan</span>
                                <span className="font-bold text-slate-900 dark:text-white uppercase">{currentPlanDisplay}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                                    displayStatus === 'ACTIVE'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
                                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                                }`}>
                                    {displayStatus}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Billing Cycle</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200 capitalize">{subscription.billingCycle?.toLowerCase()}</span>
                            </div>
                            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Expires</span>
                                <span className={`text-sm font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-200'}`}>
                                    {new Date(subscription.endDate).toLocaleDateString(locale)}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic">No active subscription found.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white">Manage Subscription</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan Type</label>
                                <select
                                    name="packageId"
                                    value={formData.packageId}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="TRIAL">TRIAL (Fallback)</option>
                                    {packages && packages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                    <option value="SUSPENDED">SUSPENDED</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiration Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
