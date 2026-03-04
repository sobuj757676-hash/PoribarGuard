"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Link } from '@/i18n/routing';
import { useTranslations } from "next-intl";

const locations = [
    { host: "Dubai", home: "Jessore" },
    { host: "Riyadh", home: "Sylhet" },
    { host: "London", home: "Dhaka" },
    { host: "Malaysia", home: "Comilla" },
    { host: "Oman", home: "Chittagong" },
    { host: "Singapore", home: "Barisal" }
];

export default function Hero() {
    const t = useTranslations("Landing");
    const [locIndex, setLocIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setLocIndex((prev) => (prev + 1) % locations.length);
        }, 4000); // Change every 4 seconds
        return () => clearInterval(timer);
    }, []);

    const currentLoc = locations[locIndex];

    return (
        <section className="relative w-full min-h-screen flex items-center bg-gray-900 overflow-hidden isolate pb-20 pt-24 md:pt-0">

            {/* Background Split Screen Effect */}
            <div className="absolute inset-0 z-0 flex flex-col md:flex-row">
                {/* Left: Dark dramatic (Dubai father) */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800">
                    {/* Placeholder for real image */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1542156822-6924d1a71ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center transition-opacity duration-1000"></div>
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
                </div>

                {/* Right: Green bright (Village child) */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-emerald-950">
                    {/* Placeholder for real image */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1596489397940-0255d65451bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center transition-opacity duration-1000"></div>
                    <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-l from-emerald-950 via-emerald-900/80 to-transparent mix-blend-multiply"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-12 mt-12 md:mt-0">

                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full md:w-3/5 text-center md:text-left"
                >
                    <div className="inline-block bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
                        <span className="text-emerald-400 font-bold text-sm tracking-wide">BD EDITION — #1 PARENTAL CONTROL APP</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 drop-shadow-lg flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                        <div className="relative inline-flex items-center min-w-[5.5em] h-[1.2em] overflow-hidden align-bottom">
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={currentLoc.host}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="absolute left-0 bottom-0 text-white"
                                >
                                    {currentLoc.host}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span>থেকে</span>
                        <div className="relative inline-flex items-center min-w-[6.5em] h-[1.2em] overflow-hidden align-bottom text-emerald-400">
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={currentLoc.home}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="absolute left-0 bottom-0 text-emerald-400"
                                >
                                    {currentLoc.home}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span>বাড়িতে আপনার সন্তানকে দেখুন</span>
                        <span className="mt-2 md:mt-0">— ২৪ ঘণ্টা নিরাপদে</span>
                    </h1>

                    <div className="text-lg md:text-xl text-emerald-50 font-medium mb-6 flex flex-wrap justify-center md:justify-start items-center gap-x-2">
                        <span>From</span>
                        <div className="relative inline-flex overflow-hidden min-w-[5.5em] h-[1.5em]">
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={currentLoc.host}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute left-0 text-emerald-200"
                                >
                                    {currentLoc.host}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span>to Your</span>
                        <div className="relative inline-flex overflow-hidden min-w-[6.5em] h-[1.5em]">
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={currentLoc.home}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute left-0 text-emerald-200"
                                >
                                    {currentLoc.home}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span>{t("heroSubtitle")}</span>
                    </div>

                    <p className="text-base md:text-lg text-gray-300 font-medium mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                        {t("heroTitle")}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(5,150,105,0.4)] hover:shadow-[0_0_40px_rgba(5,150,105,0.6)] transition-all transform hover:-translate-y-1 text-center">
                            Start Free 7-Day Trial
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2">
                            <PlayCircle className="w-6 h-6 text-emerald-400" />
                            Watch 45-sec Video
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Trusted by 2,347+ BD families</span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1"><span className="text-emerald-500">✓</span> 100% Legal</span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1"><span className="text-emerald-500">✓</span> bKash/Nagad Accepted</span>
                    </div>
                </motion.div>

                {/* Right Visual (Floating Phone Profile) */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="w-full md:w-2/5 hidden lg:flex justify-end relative"
                >
                    {/* Decorative glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/20 blur-[100px] rounded-full point-events-none"></div>

                    {/* Phone Mockup Frame */}
                    <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden relative z-10">
                        {/* Top Notch/Dynamic Island */}
                        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
                            <div className="w-32 h-7 bg-gray-800 rounded-b-3xl"></div>
                        </div>

                        {/* Mock App Content (Dashboard Snapshot) */}
                        <div className="w-full h-full bg-gray-50 flex flex-col relative pt-8">
                            {/* Header */}
                            <div className="px-5 py-3 bg-emerald-600 text-white flex justify-between items-center shadow-md pb-4 pt-6">
                                <div>
                                    <p className="text-[10px] text-emerald-200 uppercase font-bold">PoribarGuard BD</p>
                                    <p className="font-bold text-sm">Tracking Ayaan</p>
                                </div>
                                <div className="w-3 h-3 bg-green-400 border border-white rounded-full animate-pulse"></div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="flex-1 relative bg-emerald-50/50">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20"></div>
                                {/* Map Pin */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className="w-12 h-12 bg-emerald-500/30 rounded-full animate-ping absolute"></div>
                                    <div className="w-6 h-6 bg-emerald-600 border-2 border-white rounded-full shadow-lg relative z-10 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                {/* Floating status card inside mockup */}
                                <div className="absolute bottom-6 left-4 right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                                    <div className="bg-red-50 p-2 rounded-lg">
                                        <PlayCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Live Camera Ready</p>
                                        <p className="text-[10px] text-gray-500">Tap to connect remotely</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Nav Mock */}
                            <div className="h-16 bg-white border-t border-gray-100 flex justify-around items-center px-2 pb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 -mt-6"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
