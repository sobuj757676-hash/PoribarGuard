import React from 'react';
import { CreditCard } from 'lucide-react';

export default function SubscriptionCard({ subscription, locale }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-emerald-500" />
                    Subscription
                </h2>
            </div>
            <div className="p-6 space-y-5">
                {subscription ? (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Plan</span>
                            <span className="font-bold text-slate-900 dark:text-white uppercase">{subscription.plan}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                                subscription.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                            }`}>
                                {subscription.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Billing Cycle</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-200 capitalize">{subscription.billingCycle?.toLowerCase()}</span>
                        </div>
                        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Expires</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
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
    );
}
