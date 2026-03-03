"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, Smartphone, ShieldCheck, PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function LiveDemo() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-red-600 uppercase mb-3">Live View in Action</h2>
                    <h3 className="text-3xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                        চাইলেই লাইভ দেখুন — <br className="md:hidden" />
                        <span className="text-red-500">ঠিক কীভাবে কাজ করে?</span>
                    </h3>
                    <p className="mt-4 text-xl text-gray-500 font-medium max-w-2xl mx-auto">
                        Parent abroad থেকে এক ট্যাপে দেখুন, শুনুন, স্ক্রিন দেখুন। No technical skills required.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <CameraDemoCard />
                    <MicDemoCard />
                    <ScreenDemoCard />
                </div>

            </div>
        </section>
    );
}

// ---------------------------------------------------------
// 1. LIVE CAMERA DEMO CARD
// ---------------------------------------------------------
function CameraDemoCard() {
    const [step, setStep] = useState(0);

    // Loop sequence: 0 (Idle) -> 1 (Connecting) -> 2 (Live View + Notification) -> back to 0
    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div whileHover={{ y: -8 }} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600">
                <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Live Camera</h3>
            <p className="text-lg text-gray-600 mb-8 h-14" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                চাইলেই ছেলের সামনের বা পেছনের ক্যামেরা লাইভ দেখুন
            </p>

            {/* Animation Canvas */}
            <div className="bg-gray-900 h-64 rounded-3xl relative overflow-hidden shadow-inner flex flex-col justify-end p-4 border-4 border-gray-800">

                {/* State 0: Idle Parent UI */}
                <AnimatePresence>
                    {step === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center gap-3">
                                <PlayCircle className="w-10 h-10 text-white" />
                                <span className="text-white font-bold text-sm">Tap to Start Camera</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* State 1: Connecting */}
                <AnimatePresence>
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-4"
                        >
                            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-red-400 font-bold text-sm tracking-widest uppercase">Connecting to Device...</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* State 2: Live View Active */}
                <AnimatePresence>
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')] bg-cover bg-center"
                        >
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
                                </div>
                                <div className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                                    Front Camera
                                </div>
                            </div>

                            {/* Child Side Notification Simulation */}
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-2xl flex items-start gap-3 border border-gray-200"
                            >
                                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-gray-900 leading-tight">Safety Monitor Active</p>
                                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Parent requesting 5 min camera access for safety verification.</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">5/10/30 Mins</span>
                <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full underline decoration-dashed">No Child Approval Needed</span>
            </div>
        </motion.div>
    );
}

// ---------------------------------------------------------
// 2. LIVE MIC DEMO CARD
// ---------------------------------------------------------
function MicDemoCard() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div whileHover={{ y: -8 }} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Mic className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Live Mic</h3>
            <p className="text-lg text-gray-600 mb-8 h-14" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                ঘরের আওয়াজ শুনুন (Ambient Listen)
            </p>

            {/* Animation Canvas */}
            <div className="bg-blue-950 h-64 rounded-3xl relative overflow-hidden shadow-inner flex flex-col justify-center items-center p-4 border-4 border-blue-900 border-opacity-50">

                {/* State 0: Idle */}
                <AnimatePresence>
                    {step === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center flex-col gap-3"
                        >
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Mic className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-blue-200 font-bold text-sm">Tap to Listen</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* State 1: Connecting */}
                <AnimatePresence>
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                        >
                            <div className="flex gap-1 items-center justify-center h-12">
                                <motion.div animate={{ height: ["20%", "100%", "20%"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 bg-blue-500 rounded-full"></motion.div>
                                <motion.div animate={{ height: ["40%", "80%", "40%"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }} className="w-2 bg-blue-500 rounded-full"></motion.div>
                                <motion.div animate={{ height: ["60%", "40%", "60%"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 bg-blue-500 rounded-full"></motion.div>
                            </div>
                            <span className="text-blue-300 font-bold text-sm tracking-widest uppercase">Establishing Audio...</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* State 2: Active Listening */}
                <AnimatePresence>
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center w-full"
                        >
                            <div className="absolute top-4 right-4">
                                <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div> REC
                                </div>
                            </div>

                            {/* Simulated Audio Waveform (Active) */}
                            <div className="flex gap-1.5 items-center justify-center h-20 w-full px-8">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [`${Math.random() * 40 + 20}%`, `${Math.random() * 80 + 20}%`, `${Math.random() * 40 + 20}%`] }}
                                        transition={{ repeat: Infinity, duration: Math.random() * 0.5 + 0.3 }}
                                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"
                                    ></motion.div>
                                ))}
                            </div>

                            <p className="text-blue-200 mt-6 font-medium text-sm">Listening to environment...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Crystal Clear Audio</span>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Low Data Usage</span>
            </div>
        </motion.div>
    );
}

// ---------------------------------------------------------
// 3. LIVE SCREEN DEMO CARD
// ---------------------------------------------------------
function ScreenDemoCard() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 3);
        }, 4500);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div whileHover={{ y: -8 }} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Live Screen</h3>
            <p className="text-lg text-gray-600 mb-8 h-14" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                ছেলে কী দেখছে লাইভ দেখুন (Screen Mirror)
            </p>

            {/* Animation Canvas */}
            <div className="bg-gray-100 h-64 rounded-3xl relative overflow-hidden shadow-inner flex flex-col items-center justify-end border-4 border-gray-200 pt-6">

                {/* Mock Phone Frame */}
                <div className="w-32 h-64 bg-black rounded-t-3xl border-[6px] border-black border-b-0 relative overflow-hidden flex flex-col translate-y-2">
                    {/* Notch */}
                    <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-50">
                        <div className="w-16 h-4 bg-black rounded-b-xl"></div>
                    </div>

                    {/* State 0 & 1: Idle Screen */}
                    <AnimatePresence>
                        {(step === 0 || step === 1) && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center"
                            >
                                <div className="flex flex-wrap gap-2 p-2 justify-center opacity-30">
                                    <div className="w-6 h-6 rounded bg-blue-500"></div>
                                    <div className="w-6 h-6 rounded bg-green-500"></div>
                                    <div className="w-6 h-6 rounded bg-red-500"></div>
                                    <div className="w-6 h-6 rounded bg-yellow-500"></div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* State 2: Simulated App Scrolling (TikTok/Reels mock) */}
                    <AnimatePresence>
                        {step === 2 && (
                            <motion.div
                                initial={{ y: 200 }} animate={{ y: [0, -100, -200] }} transition={{ duration: 4, ease: "linear" }}
                                className="absolute inset-x-0 top-0 flex flex-col bg-gray-900"
                            >
                                {/* App Video Mock 1 */}
                                <div className="w-full h-[240px] bg-indigo-900 relative border-b border-black">
                                    <div className="absolute bottom-4 right-2 flex flex-col gap-2">
                                        <div className="w-5 h-5 rounded-full bg-white/20"></div>
                                        <div className="w-5 h-5 rounded-full bg-white/20"></div>
                                    </div>
                                </div>
                                {/* App Video Mock 2 */}
                                <div className="w-full h-[240px] bg-purple-900 relative border-b border-black">
                                    <div className="absolute bottom-4 right-2 flex flex-col gap-2">
                                        <div className="w-5 h-5 rounded-full bg-white/20"></div>
                                        <div className="w-5 h-5 rounded-full bg-white/20"></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Screen Record Overlay (Parent POV) */}
                    <AnimatePresence>
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute inset-x-0 top-6 bottom-0 ring-4 ring-inset ring-purple-500/50 z-20 pointer-events-none"
                            >
                                <div className="absolute top-2 left-2 bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg">
                                    MIRRORING
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Big Connection Status Overlay outside phone */}
                <AnimatePresence>
                    {step === 1 && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center px-4"
                        >
                            <Smartphone className="w-12 h-12 text-purple-500 animate-bounce mb-2" />
                            <p className="text-sm font-black text-purple-900">Requesting Screen Share...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">See Installed Apps</span>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Catch Cyberbullying</span>
            </div>
        </motion.div>
    );
}
