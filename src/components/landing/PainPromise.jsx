"use client";

import { motion } from "framer-motion";
import { Clock, ShieldAlert, Smartphone, EyeOff } from "lucide-react";

export default function PainPromise() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center md:text-left mb-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="md:w-1/2"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                            আপনি দূরে থাকেন, <br />
                            <span className="text-emerald-600">কিন্তু চিন্তা তো কাছে থাকে</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.2 }}
                        className="md:w-1/2 text-gray-600 text-lg md:text-xl font-medium"
                    >
                        দূরপ্রবাসের কষ্ট আমরা বুঝি। আপনার অবর্তমানে দেশে সন্তানের নিরাপত্তা নিশ্চিত করাই আমাদের লক্ষ্য।
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                    {/* Left: Emotional Photo (Placeholder) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group"
                    >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601581975053-76800fa13861?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>

                        {/* Overlay Video Call Mock */}
                        <div className="absolute bottom-6 left-6 right-6 bg-white/20 backdrop-blur-lg border border-white/30 p-5 rounded-2xl flex items-center justify-between shadow-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-50"></div>
                                    <div className="w-10 h-10 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-white font-extrabold text-base tracking-wide">রাত ১১:৩০ (বাংলাদেশ সময়)</p>
                                    <p className="text-red-200 font-medium text-sm mt-0.5">সন্তান এখনো বাইরে?</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Pain Points */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-6"
                    >
                        <PainCard
                            icon={<Clock className="w-6 h-6 text-orange-500" />}
                            text="রাত ১১টায় ঘুম আসে না — ছেলে কোথায় আছে?"
                            bgColor="bg-orange-50 border-orange-100"
                        />
                        <PainCard
                            icon={<ShieldAlert className="w-6 h-6 text-red-500" />}
                            text="গ্রামে বন্যা বা রাজনৈতিক অস্থিরতা হলে কী হবে?"
                            bgColor="bg-red-50 border-red-100"
                        />
                        <PainCard
                            icon={<Smartphone className="w-6 h-6 text-blue-500" />}
                            text="নতুন অ্য়াপ ইনস্টল করলে কী দেখছে?"
                            bgColor="bg-blue-50 border-blue-100"
                        />
                        <PainCard
                            icon={<EyeOff className="w-6 h-6 text-purple-500" />}
                            text="প্রার্থনার সময় মোবাইল চলছে কি না?"
                            bgColor="bg-purple-50 border-purple-100"
                        />

                        <div className="mt-8 p-6 bg-emerald-900 rounded-2xl text-white shadow-xl">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                PoribarGuard BD দিয়ে এই চিন্তা শেষ করুন।
                            </h3>
                            <p className="text-emerald-100/80 text-sm">
                                We handle the technology so you can focus on earning for your family's future.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

function PainCard({ icon, text, bgColor }) {
    return (
        <div className={`p-5 rounded-2xl border ${bgColor} flex items-center gap-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/50 backdrop-blur-sm relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-20"></div>
            <div className="bg-white p-3.5 rounded-xl shadow-sm ring-1 ring-gray-100 shrink-0">
                {icon}
            </div>
            <p className="font-bold text-gray-800 text-lg leading-snug" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>{text}</p>
        </div>
    );
}
