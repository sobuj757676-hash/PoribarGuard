"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Link } from '@/i18n/routing';
import { useTranslations } from "next-intl";

const defaultLocations = [
    { host: "Dubai", home: "Jessore" },
    { host: "Riyadh", home: "Sylhet" },
    { host: "London", home: "Dhaka" },
    { host: "Malaysia", home: "Comilla" },
    { host: "Oman", home: "Chittagong" },
    { host: "Singapore", home: "Barisal" }
];

export default function Hero({ config }) {
    const t = useTranslations("Landing");
    const locations = config?.locations?.length > 0 ? config.locations : defaultLocations;
    const badgeText = config?.badgeText || 'BD EDITION — #1 PARENTAL CONTROL APP';
    const ctaText = config?.ctaText || 'Start Free 7-Day Trial';
    const ctaLink = config?.ctaLink || '/dashboard';
    const videoBtnText = config?.videoBtnText || 'Watch 45-sec Video';
    const trustBadges = config?.trustBadges || ['Trusted by 2,347+ BD families', '100% Legal', 'bKash/Nagad Accepted'];
    const heroTheme = config?.heroTheme || 'dark';

    const [locIndex, setLocIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setLocIndex((prev) => (prev + 1) % locations.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [locations.length]);

    const currentLoc = locations[locIndex];

    const isLight = heroTheme === 'light';

    return (
        <section className={`relative w-full min-h-screen flex items-center overflow-hidden isolate pb-20 pt-24 md:pt-0 ${isLight ? 'bg-white' : 'bg-gray-900'}`}>

            {/* Background Split Screen Effect */}
            <div className="absolute inset-0 z-0 flex flex-col md:flex-row">
                <div className={`w-full md:w-1/2 h-1/2 md:h-full relative border-b md:border-b-0 md:border-r ${isLight ? 'bg-slate-50 border-gray-200' : 'bg-gray-900 border-gray-800'}`}>
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1542156822-6924d1a71ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center transition-opacity duration-1000"></div>
                    <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r ${isLight ? 'from-slate-50 via-slate-50/80' : 'from-gray-900 via-gray-900/80'} to-transparent`}></div>
                </div>
                <div className={`w-full md:w-1/2 h-1/2 md:h-full relative ${isLight ? 'bg-emerald-50' : 'bg-emerald-950'}`}>
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1596489397940-0255d65451bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center transition-opacity duration-1000"></div>
                    <div className={`absolute inset-0 bg-gradient-to-b md:bg-gradient-to-l ${isLight ? 'from-emerald-50 via-emerald-100/80' : 'from-emerald-950 via-emerald-900/80'} to-transparent mix-blend-multiply`}></div>
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
                    <div className={`inline-block border rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm ${isLight ? 'bg-emerald-100/50 border-emerald-300' : 'bg-emerald-500/20 border-emerald-500/30'}`}>
                        <span className={`font-bold text-sm tracking-wide ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{badgeText}</span>
                    </div>

                    <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 drop-shadow-lg flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1 ${isLight ? 'text-gray-900' : 'text-white'}`} style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                        <div className="relative inline-flex items-center min-w-[5.5em] h-[1.2em] overflow-hidden align-bottom">
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={currentLoc.host}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className={`absolute left-0 bottom-0 ${isLight ? 'text-gray-900' : 'text-white'}`}
                                >
                                    {currentLoc.host}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span>থেকে</span>
                        <div className={`relative inline-flex items-center min-w-[6.5em] h-[1.2em] overflow-hidden align-bottom ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={currentLoc.home}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className={`absolute left-0 bottom-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}
                                >
                                    {currentLoc.home}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span>বাড়িতে আপনার সন্তানকে দেখুন</span>
                        <span className="mt-2 md:mt-0">— ২৪ ঘণ্টা নিরাপদে</span>
                    </h1>

                    <div className={`text-lg md:text-xl font-medium mb-6 flex flex-wrap justify-center md:justify-start items-center gap-x-2 ${isLight ? 'text-gray-600' : 'text-emerald-50'}`}>
                        <span>From</span>
                        <div className="relative inline-flex overflow-hidden min-w-[5.5em] h-[1.5em]">
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={currentLoc.host}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute left-0 ${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-200'}`}
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
                                    className={`absolute left-0 ${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-200'}`}
                                >
                                    {currentLoc.home}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span>{t("heroSubtitle")}</span>
                    </div>

                    <p className={`text-base md:text-lg font-medium mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed ${isLight ? 'text-gray-500' : 'text-gray-300'}`}>
                        {t("heroTitle")}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                        <Link href={ctaLink} className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(5,150,105,0.4)] hover:shadow-[0_0_40px_rgba(5,150,105,0.6)] transition-all transform hover:-translate-y-1 text-center">
                            {ctaText}
                        </Link>
                        <button className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-md transition-all flex items-center justify-center gap-2 ${isLight ? 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm' : 'text-white bg-white/10 hover:bg-white/20 border border-white/20'}`}>
                            <PlayCircle className={`w-6 h-6 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                            {videoBtnText}
                        </button>
                    </div>

                    <div className={`mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs md:text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        {trustBadges.map((badge, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                                {idx > 0 && <span className="hidden md:inline mr-4">•</span>}
                                <span className={isLight ? 'text-emerald-600' : 'text-emerald-500'}>✓</span> {badge}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Right Visual (Floating Phone Profile) */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="w-full md:w-2/5 hidden lg:flex justify-end relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>
                    <motion.div
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 ring-1 ring-white/10"
                    >
                        {/* Status bar */}
                        <div className="absolute top-0 inset-x-0 h-7 flex justify-between items-center px-6 z-50 text-[10px] text-white font-medium">
                            <span>12:00</span>
                            <div className="flex gap-1.5 items-center">
                                <div className="w-3 h-3 border border-white/50 rounded-sm"></div>
                                <div className="w-3 h-3 bg-white/80 rounded-sm"></div>
                            </div>
                        </div>
                        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
                            <div className="w-32 h-7 bg-gray-800 rounded-b-3xl"></div>
                        </div>

                        <div className="w-full h-full bg-gray-50 flex flex-col relative pt-8">
                            <div className="px-5 py-4 bg-emerald-600 text-white flex justify-between items-center shadow-lg pb-5 pt-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-90"></div>
                                <div className="relative z-10 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center font-bold text-lg shadow-sm">
                                        A
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-emerald-100 uppercase font-bold tracking-widest">Live Monitoring</p>
                                        <p className="font-extrabold text-sm text-white drop-shadow-sm">Tracking Ayaan</p>
                                    </div>
                                </div>
                                <div className="relative z-10 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
                                </div>
                            </div>
                            <div className="flex-1 relative bg-emerald-50/50">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20 mix-blend-multiply"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full animate-ping absolute"></div>
                                    <div className="w-12 h-12 bg-emerald-500/40 rounded-full animate-pulse absolute"></div>
                                    <div className="w-8 h-8 bg-emerald-600 border-2 border-white rounded-full shadow-[0_0_20px_rgba(5,150,105,0.6)] relative z-10 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                    </div>
                                </div>

                                {/* Floating Alert Card Mock */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                    className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex items-center gap-3"
                                >
                                    <div className="bg-red-50 p-2.5 rounded-xl border border-red-100">
                                        <PlayCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-extrabold text-gray-900">Live Camera Ready</p>
                                        <p className="text-[10px] font-medium text-gray-500 mt-0.5">Tap to connect securely</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* App Nav Bar */}
                            <div className="h-20 bg-white border-t border-gray-100 flex justify-around items-center px-2 pb-4 pt-2 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-20">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg></div>
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
                                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border-[3px] border-emerald-500 -mt-8 flex items-center justify-center shadow-lg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg></div>
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
}
