import React from 'react';
import { CreditCard } from 'lucide-react';

export default function SubscriptionCard({ subscription, locale }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-emerald-500" />
                    Subscription
                </h2>
            </div>
            <div className="p-6 space-y-4">
                {subscription ? (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Plan</span>
                            <span className="font-bold text-slate-900 uppercase">{subscription.plan}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Status</span>
                            <span className={`text-sm font-medium ${subscription.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                {subscription.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Billing Cycle</span>
                            <span className="text-sm font-medium text-slate-900 capitalize">{subscription.billingCycle?.toLowerCase()}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-sm text-slate-500">Expires</span>
                            <span className="text-sm font-medium text-slate-900">
                                {new Date(subscription.endDate).toLocaleDateString(locale)}
                            </span>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-slate-500 italic text-center py-4">No active subscription found.</p>
                )}
            </div>
        </div>
    );
}
