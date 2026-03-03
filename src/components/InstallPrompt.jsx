"use client";

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if user already dismissed
        if (localStorage.getItem('pwa_prompt_dismissed') === 'true') {
            setIsDismissed(true);
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        setIsInstallable(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isInstallable || isDismissed) return null;

    return (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-emerald-600 text-white p-4 rounded-xl shadow-2xl z-[100] animate-in slide-in-from-top-4 flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                    <Download className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <p className="font-bold text-sm">Install PoribarGuard BD</p>
                    <p className="text-xs text-emerald-100">Add to home screen for faster access</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleInstallClick}
                    className="bg-white text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-50 transition"
                >
                    Install
                </button>
                <button onClick={handleDismiss} className="p-1 hover:bg-emerald-700 rounded-md transition">
                    <X className="w-4 h-4 text-emerald-100" />
                </button>
            </div>
        </div>
    );
}
