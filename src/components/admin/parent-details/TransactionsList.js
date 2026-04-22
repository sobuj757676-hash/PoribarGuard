import React from 'react';
import { Activity } from 'lucide-react';

export default function TransactionsList({ transactions, locale }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-500" />
                    Recent Transactions
                </h2>
            </div>
            <div className="p-0">
                {transactions && transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Amount</th>
                                    <th className="px-6 py-3 font-medium">Gateway</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map(trx => (
                                    <tr key={trx.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 text-slate-600">{new Date(trx.createdAt).toLocaleDateString(locale)}</td>
                                        <td className="px-6 py-3 font-medium">৳{trx.amount}</td>
                                        <td className="px-6 py-3 text-slate-600">{trx.gateway}</td>
                                        <td className="px-6 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${trx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : trx.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {trx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        No recent transactions found.
                    </div>
                )}
            </div>
        </div>
    );
}
