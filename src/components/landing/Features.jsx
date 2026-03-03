"use client";

import { motion } from "framer-motion";
import { DownloadCloud, Map, Video, Clock, ShieldAlert, EyeOff } from "lucide-react";

export default function Features() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const features = [
        {
            icon: <DownloadCloud className="w-8 h-8" />,
            title_bn: "Remote Install from Abroad",
            desc: "TeamViewer বা Magic APK দিয়ে দূর থেকে ইনস্টল করুন",
            color: "text-blue-600",
            bgBase: "bg-blue-50/50",
            bgHover: "hover:bg-blue-600 hover:text-white"
        },
        {
            icon: <Map className="w-8 h-8" />,
            title_bn: "Live Location + Village Geofence",
            desc: "স্কুল, টিউশন, বাড়ি, মসজিদ — সব জায়গায় সীমানা",
            color: "text-emerald-600",
            bgBase: "bg-emerald-50/50",
            bgHover: "hover:bg-emerald-600 hover:text-white"
        },
        {
            icon: <Video className="w-8 h-8" />,
            title_bn: "Live Camera, Mic & Screen",
            desc: "চাইলেই দেখুন, শুনুন, স্ক্রিন দেখুন (on-demand)",
            color: "text-red-600",
            bgBase: "bg-red-50/50",
            bgHover: "hover:bg-red-600 hover:text-white"
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title_bn: "Prayer Time + Study Auto Lock",
            desc: "Fajr, Maghrib, Isha ও পড়াশোনার সময় অটো লক",
            color: "text-indigo-600",
            bgBase: "bg-indigo-50/50",
            bgHover: "hover:bg-indigo-600 hover:text-white"
        },
        {
            icon: <ShieldAlert className="w-8 h-8" />,
            title_bn: "SOS Panic Button",
            desc: "এক ট্যাপে লোকেশন + ভয়েস নোট + ফটো পাঠায়",
            color: "text-orange-600",
            bgBase: "bg-orange-50/50",
            bgHover: "hover:bg-orange-600 hover:text-white"
        },
        {
            icon: <EyeOff className="w-8 h-8" />,
            title_bn: "Full Stealth Mode",
            desc: "শিশু কখনো জানবে না যে মনিটর হচ্ছে",
            color: "text-gray-900",
            bgBase: "bg-gray-100/50",
            bgHover: "hover:bg-gray-900 hover:text-white"
        }
    ];

    return (
        <section className="py-24 bg-gray-50 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">6 Core Pillars</h2>
                        <h3 className="text-3xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                            যা আপনি পাবেন — <br className="md:hidden" />
                            <span className="text-emerald-600 underline decoration-wavy decoration-emerald-200">শুধুমাত্র PoribarGuard BD-এ</span>
                        </h3>
                    </motion.div>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feat, idx) => (
                        <motion.div
                            key={idx}
                            variants={item}
                            className={`group flex flex-col items-center text-center p-8 rounded-3xl ${feat.bgBase} border border-transparent hover:border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${feat.bgHover}`}
                        >
                            <div className={`p-4 rounded-2xl bg-white shadow-sm mb-6 ${feat.color} group-hover:text-current transition-colors duration-300`}>
                                {feat.icon}
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-white transition-colors duration-300">{feat.title_bn}</h4>
                            <p className="text-gray-600 font-medium group-hover:text-gray-100 transition-colors duration-300" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                                {feat.desc}
                            </p>

                            <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 text-sm font-bold bg-white/20 px-6 py-2 rounded-full hidden md:block">
                                Learn More
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
