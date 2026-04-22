import React from 'react';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

export default function TransactionsList({ transactions, locale }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-500" />
                    Recent Transactions
                </h2>
            </div>
            <div className="p-0">
                {transactions && transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-wider">Date</th>
                                    <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-wider">Amount</th>
                                    <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-wider">Gateway</th>
                                    <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {transactions.map(trx => (
                                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{new Date(trx.createdAt).toLocaleDateString(locale)}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">৳{trx.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold text-xs px-2 py-1 rounded ${trx.gateway === 'bKash' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' : trx.gateway === 'Nagad' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                                {trx.gateway}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1 text-xs font-bold ${trx.status === 'FAILED' ? 'text-red-500' : trx.status === 'SUCCESS' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {trx.status === 'FAILED' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} {trx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No recent transactions found.
                    </div>
                )}
            </div>
        </div>
    );
}
