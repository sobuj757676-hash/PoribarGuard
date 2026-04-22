import React from 'react';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function ParentProfileCard({ parent, locale }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden col-span-1 lg:col-span-2">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-500" />
                    Parent Profile
                </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="space-y-1">
                    <p className="text-sm text-slate-500 flex items-center"><User className="w-4 h-4 mr-1"/> Name</p>
                    <p className="font-medium text-slate-900">{parent.name}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-slate-500 flex items-center"><Mail className="w-4 h-4 mr-1"/> Email</p>
                    <p className="font-medium text-slate-900">{parent.email}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-slate-500 flex items-center"><Phone className="w-4 h-4 mr-1"/> Phone</p>
                    <p className="font-medium text-slate-900">{parent.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-slate-500 flex items-center"><MapPin className="w-4 h-4 mr-1"/> Location</p>
                    <p className="font-medium text-slate-900">{parent.city ? `${parent.city}, ` : ''}{parent.country || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-slate-500 flex items-center"><Calendar className="w-4 h-4 mr-1"/> Registered On</p>
                    <p className="font-medium text-slate-900">{new Date(parent.createdAt).toLocaleDateString(locale)}</p>
                </div>
            </div>
        </div>
    );
}
