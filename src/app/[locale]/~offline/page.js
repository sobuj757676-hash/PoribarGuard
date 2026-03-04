"use client";

import { WifiOff, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl max-w-sm w-full">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <WifiOff className="w-10 h-10 text-gray-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    You're Offline
                </h1>

                <p className="text-gray-500 text-sm mb-8">
                    It seems you've lost your internet connection. Check your network settings and try again.
                </p>

                <button
                    onClick={() => router.refresh()}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-5 h-5" />
                    Retry Connection
                </button>
            </div>
        </div>
    );
}