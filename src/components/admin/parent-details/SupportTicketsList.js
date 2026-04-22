import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function SupportTicketsList({ supportTickets, locale }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2 text-amber-500" />
                    Recent Support Tickets
                </h2>
            </div>
            <div className="p-0">
                {supportTickets && supportTickets.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                        {supportTickets.map(ticket => (
                            <li key={ticket.id} className="p-4 hover:bg-slate-50">
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-slate-800 text-sm">{ticket.title}</span>
                                    <span className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleDateString(locale)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {ticket.status}
                                    </span>
                                    <span className="text-xs text-slate-500 uppercase">{ticket.priority}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        No support tickets logged.
                    </div>
                )}
            </div>
        </div>
    );
}
