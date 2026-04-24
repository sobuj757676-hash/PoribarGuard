"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAdminManualPayments } from '@/hooks/useApi';
import { CheckCircle, XCircle, Search, Download, Clock, Maximize2, ExternalLink, X, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export default function AdminManualPaymentsTab() {
    const { payments, isLoading: loading, mutate } = useAdminManualPayments();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const filteredPayments = payments?.filter(p =>
        p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.senderDigits.includes(searchQuery)
    );

    const handleAction = async (action) => {
        if (!selectedPayment) return;
        if (action === 'REJECT' && !rejectionReason) {
            toast.error("Please provide a rejection reason.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/payments/manual/${selectedPayment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, rejectionReason })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message);
                setSelectedPayment(null);
                setRejectionReason('');
                mutate(); // Refresh the list
            } else {
                toast.error(data.error || `Failed to ${action.toLowerCase()} payment`);
            }
        } catch (error) {
            toast.error("Network error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold">Manual Payments Directory</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {!loading ? `${payments?.length || 0} total requests` : 'Loading...'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => mutate()} className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search email, name, digits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">User Info</th>
                                <th className="px-6 py-4">Package & Amount</th>
                                <th className="px-6 py-4">Method & Digits</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading requests...</td>
                                </tr>
                            ) : filteredPayments?.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500 italic">No manual payments found.</td>
                                </tr>
                            ) : (
                                filteredPayments?.map(payment => (
                                    <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white">{payment.user?.name || 'Unknown User'}</div>
                                            <div className="text-xs text-slate-500">{payment.user?.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white uppercase">{payment.package?.name || 'Unknown'}</div>
                                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">৳{payment.amount}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${payment.method === 'bKash' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}`}>{payment.method}</span>
                                                <span className="font-mono text-slate-600 dark:text-slate-400">...{payment.senderDigits}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-max ${
                                                payment.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                payment.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                {payment.status === 'APPROVED' && <CheckCircle className="w-3.5 h-3.5" />}
                                                {payment.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                                                {payment.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedPayment(payment)}
                                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold text-sm transition"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification & Approval Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && setSelectedPayment(null)} />
                    <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                        {/* Left Side: Screenshot Evidence */}
                        <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-950 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 self-start flex items-center gap-2"><ExternalLink className="w-5 h-5"/> Visual Evidence</h3>
                            <div className="relative w-full h-64 md:h-[500px] rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner bg-slate-200 dark:bg-slate-800">
                                {selectedPayment.screenshotUrl ? (
                                    <Image
                                        src={selectedPayment.screenshotUrl}
                                        alt="Payment Screenshot"
                                        layout="fill"
                                        objectFit="contain"
                                        className="hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">No Image Provided</div>
                                )}
                            </div>
                            <a
                                href={selectedPayment.screenshotUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                            >
                                <Maximize2 className="w-4 h-4"/> Open Image in New Tab
                            </a>
                        </div>

                        {/* Right Side: Data & Actions */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col bg-white dark:bg-slate-900">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify Payment</h2>
                                    <p className="text-sm text-slate-500">Submitted by {selectedPayment.user?.email}</p>
                                </div>
                                <button onClick={() => !isSubmitting && setSelectedPayment(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Data Comparison Block */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 mb-6">
                                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Method</span>
                                    <span className={`px-2 py-1 rounded text-sm font-bold ${selectedPayment.method === 'bKash' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}`}>{selectedPayment.method}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Amount Required</span>
                                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">৳{selectedPayment.amount}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Package</span>
                                    <span className="text-slate-900 dark:text-white font-bold uppercase">{selectedPayment.package?.name}</span>
                                </div>
                                <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                    <span className="text-indigo-800 dark:text-indigo-300 font-bold">Sender Last Digits</span>
                                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-widest">{selectedPayment.senderDigits}</span>
                                </div>
                            </div>

                            {/* Actions Logic */}
                            <div className="mt-auto space-y-4">
                                {selectedPayment.status === 'PENDING' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction('APPROVE')}
                                            disabled={isSubmitting}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                                            title="Activate subscription for this user"
                                        >
                                            <CheckCircle className="w-5 h-5"/> Approve & Activate Subscription
                                        </button>

                                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 mt-4">
                                            <label className="block text-sm font-semibold text-red-800 dark:text-red-400 mb-2">Reject Request</label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Reason for rejection (e.g. 'Wrong digits', 'Amount mismatch')..."
                                                className="w-full bg-white dark:bg-slate-950 border border-red-200 dark:border-red-800/50 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                                                rows="2"
                                            />
                                            <button
                                                onClick={() => handleAction('REJECT')}
                                                disabled={isSubmitting}
                                                className="w-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 font-bold py-2 rounded-lg transition disabled:opacity-50"
                                            >
                                                Reject Payment
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className={`p-4 rounded-xl border ${selectedPayment.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'} text-center font-bold`}>
                                        This payment has already been {selectedPayment.status.toLowerCase()}.
                                        {selectedPayment.status === 'REJECTED' && selectedPayment.rejectionReason && (
                                            <p className="text-sm mt-2 font-normal text-red-600 dark:text-red-300">Reason: {selectedPayment.rejectionReason}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
