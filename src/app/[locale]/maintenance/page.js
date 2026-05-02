"use client";

import { AlertTriangle, Clock, RefreshCcw, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function MaintenancePage() {
    const t = useTranslations('landing');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -z-10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-tr-full -z-10 blur-xl"></div>

                <div className="flex justify-center mb-8 relative">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-ping opacity-75"></div>
                        <div className="bg-emerald-100 dark:bg-emerald-900/50 p-6 rounded-full relative shadow-inner">
                            <Clock className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                    System Maintenance
                </h1>
                
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    PoribarGuard BD is currently undergoing scheduled maintenance to improve system stability and deploy new security features. We&apos;ll be back online shortly.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center gap-4 text-left border border-slate-100 dark:border-slate-700 mb-8">
                    <div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Child Devices Unaffected</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Background protection remains active</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={() => window.location.reload()} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20">
                        <RefreshCcw className="w-5 h-5" /> Check Status Again
                    </button>
                    <Link href="/login" className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-6 rounded-xl transition text-sm">
                        Admin Access
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-slate-400 dark:text-slate-500 text-sm font-medium flex items-center gap-2">
                <Image src="/logo.png" alt="PoribarGuard Logo" width={24} height={24} className="opacity-50 grayscale" />
                PoribarGuard BD Engineering
            </div>
        </div>
    );
}
