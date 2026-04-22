import React from 'react';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function ParentProfileCard({ parent, locale }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-500" />
                    Parent Profile
                </h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                        <User className="w-3.5 h-3.5 mr-1.5"/> Name
                    </p>
                    <p className="font-medium text-slate-900 dark:text-slate-200">{parent.name}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1.5"/> Email
                    </p>
                    <p className="font-medium text-slate-900 dark:text-slate-200">{parent.email}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5"/> Phone
                    </p>
                    <p className="font-medium text-slate-900 dark:text-slate-200">{parent.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5"/> Location
                    </p>
                    <p className="font-medium text-slate-900 dark:text-slate-200">{parent.city ? `${parent.city}, ` : ''}{parent.country || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5"/> Registered On
                    </p>
                    <p className="font-medium text-slate-900 dark:text-slate-200">{new Date(parent.createdAt).toLocaleDateString(locale)}</p>
                </div>
            </div>
        </div>
    );
}
