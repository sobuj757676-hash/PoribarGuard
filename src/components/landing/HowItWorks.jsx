"use client";

import { motion } from "framer-motion";
import { Smartphone, Link as LinkIcon, ShieldCheck } from "lucide-react";

export default function HowItWorks() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                            ৩ মিনিটে শুরু করুন
                        </h2>
                        <p className="mt-4 text-xl text-gray-500 font-medium max-w-2xl mx-auto">
                            No technical skills needed. Setup from anywhere in the world.
                        </p>
                    </motion.div>
                </div>

                {/* Horizontal Timeline Container */}
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-12 md:gap-0 mt-12">

                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-gray-100 z-0">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="h-full bg-emerald-500 rounded-full"
                        ></motion.div>
                    </div>

                    {/* Step 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3"
                    >
                        <div className="w-24 h-24 bg-gray-50 border-4 border-white shadow-xl rounded-full flex items-center justify-center text-emerald-600 mb-6 relative">
                            <Smartphone className="w-10 h-10" />
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-600 text-white rounded-full font-black flex items-center justify-center border-2 border-white shadow-sm">1</div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Sign Up & Pay</h3>
                        <p className="text-gray-500 font-medium px-4">Create account securely using bKash, Nagad, or International Cards.</p>

                        <div className="flex gap-2 mt-4 items-center">
                            <div className="bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded">bKash</div>
                            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded">Nagad</div>
                        </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3"
                    >
                        <div className="w-24 h-24 bg-emerald-500 border-4 border-white shadow-xl shadow-emerald-500/30 rounded-full flex items-center justify-center text-white mb-6 relative transform lg:scale-110">
                            <LinkIcon className="w-10 h-10" />
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-800 text-white rounded-full font-black flex items-center justify-center border-2 border-white shadow-sm">2</div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-emerald-600">Send Magic Link</h3>
                        <p className="text-gray-500 font-medium px-4">Send the custom SMS link to child. It auto-installs in stealth mode.</p>
                        <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full mt-4">Or use TeamViewer</span>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.0 }}
                        className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3"
                    >
                        <div className="w-24 h-24 bg-gray-900 border-4 border-white shadow-xl rounded-full flex items-center justify-center text-emerald-400 mb-6 relative">
                            <ShieldCheck className="w-10 h-10" />
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-600 text-white rounded-full font-black flex items-center justify-center border-2 border-white shadow-sm">3</div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Monitor Silently</h3>
                        <p className="text-gray-500 font-medium px-4">Open dashboard from Dubai, London, or Riyadh. Start tracking.</p>
                        <div className="flex gap-2 mt-4 text-xs font-bold text-gray-400">
                            <span>🇦🇪 UAE</span>
                            <span>🇬🇧 UK</span>
                            <span>🇸🇦 KSA</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
