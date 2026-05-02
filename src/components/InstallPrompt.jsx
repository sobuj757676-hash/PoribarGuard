"use client";

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isDismissed, setIsDismissed] = useState(false);

    const [isIos, setIsIos] = useState(false);
    const [showIosPrompt, setShowIosPrompt] = useState(false);

    useEffect(() => {
        // Wrap initial state updates in a timeout to avoid cascading renders warning
        setTimeout(() => {
            // Check if user already dismissed
            if (localStorage.getItem('pwa_prompt_dismissed') === 'true') {
                setIsDismissed(true);
                return;
            }

            // Check if device is iOS
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

            // Check if already installed (standalone mode)
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

            if (isIosDevice && !isStandalone) {
                setIsIos(true);
                // On iOS, we can't trigger a programmatic install, so we just show a guide
                setIsInstallable(true);
            }
        }, 0);

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
        if (isIos) {
            setShowIosPrompt(true);
            return;
        }

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
        <>
            {/* iOS Guide Modal */}
            {showIosPrompt && (
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-end justify-center sm:items-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 relative text-gray-900 dark:text-white text-center">
                        <button onClick={() => setShowIosPrompt(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mx-auto flex items-center justify-center mb-4">
                            <Download className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Install App</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Install this application on your home screen for quick and easy access.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-left space-y-3">
                            <p className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                                Tap the <b>Share</b> button in your Safari menu bar.
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                                Scroll down and tap <b>Add to Home Screen</b>.
                            </p>
                        </div>
                        <button onClick={handleDismiss} className="w-full mt-6 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Standard Prompt Banner */}
            {!showIosPrompt && (
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
            )}
        </>
    );
}
