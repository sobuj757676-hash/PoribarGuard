import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function SupportTicketsList({ supportTickets, locale }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2 text-amber-500" />
                    Recent Support Tickets
                </h2>
            </div>
            <div className="p-0">
                {supportTickets && supportTickets.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {supportTickets.map(ticket => (
                            <li key={ticket.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate pr-4">{ticket.title}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString(locale)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                                        ticket.status === 'OPEN'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50'
                                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                    }`}>
                                        {ticket.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{ticket.priority}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No support tickets logged.
                    </div>
                )}
            </div>
        </div>
    );
}
