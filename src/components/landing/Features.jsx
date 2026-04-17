"use client";

import { motion } from "framer-motion";
import { DownloadCloud, Map, Video, Clock, ShieldAlert, EyeOff, Star, Wifi, Lock, Bell } from "lucide-react";

const iconMap = {
    DownloadCloud: DownloadCloud, Map: Map, Video: Video, Clock: Clock,
    ShieldAlert: ShieldAlert, EyeOff: EyeOff, Star: Star, Wifi: Wifi, Lock: Lock, Bell: Bell
};

const colorMap = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50/50', hover: 'hover:bg-blue-600 hover:text-white' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50/50', hover: 'hover:bg-emerald-600 hover:text-white' },
    red: { text: 'text-red-600', bg: 'bg-red-50/50', hover: 'hover:bg-red-600 hover:text-white' },
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50/50', hover: 'hover:bg-indigo-600 hover:text-white' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50/50', hover: 'hover:bg-orange-600 hover:text-white' },
    gray: { text: 'text-gray-900', bg: 'bg-gray-100/50', hover: 'hover:bg-gray-900 hover:text-white' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50/50', hover: 'hover:bg-purple-600 hover:text-white' },
    pink: { text: 'text-pink-600', bg: 'bg-pink-50/50', hover: 'hover:bg-pink-600 hover:text-white' },
    yellow: { text: 'text-yellow-600', bg: 'bg-yellow-50/50', hover: 'hover:bg-yellow-600 hover:text-white' },
};

const defaultFeatures = [
    { title: 'Remote Install from Abroad', desc: 'TeamViewer বা Magic APK দিয়ে দূর থেকে ইনস্টল করুন', icon: 'DownloadCloud', color: 'blue' },
    { title: 'Live Location + Village Geofence', desc: 'স্কুল, টিউশন, বাড়ি, মসজিদ — সব জায়গায় সীমানা', icon: 'Map', color: 'emerald' },
    { title: 'Live Camera, Mic & Screen', desc: 'চাইলেই দেখুন, শুনুন, স্ক্রিন দেখুন (on-demand)', icon: 'Video', color: 'red' },
    { title: 'Prayer Time + Study Auto Lock', desc: 'Fajr, Maghrib, Isha ও পড়াশোনার সময় অটো লক', icon: 'Clock', color: 'indigo' },
    { title: 'SOS Panic Button', desc: 'এক ট্যাপে লোকেশন + ভয়েস নোট + ফটো পাঠায়', icon: 'ShieldAlert', color: 'orange' },
    { title: 'Full Stealth Mode', desc: 'শিশু কখনো জানবে না যে মনিটর হচ্ছে', icon: 'EyeOff', color: 'gray' }
];

export default function Features({ config }) {
    const sectionTag = config?.sectionTag || '6 Core Pillars';
    const sectionTitle = config?.sectionTitle || 'যা আপনি পাবেন — শুধুমাত্র PoribarGuard BD-এ';
    const features = config?.features?.length > 0 ? config.features : defaultFeatures;

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="py-24 bg-gray-50 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">{sectionTag}</h2>
                        <h3 className="text-3xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                            {sectionTitle}
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
                    {features.map((feat, idx) => {
                        const IconComponent = iconMap[feat.icon] || Star;
                        const colors = colorMap[feat.color] || colorMap.blue;
                        return (
                            <motion.div
                                key={idx}
                                variants={item}
                                className={`group flex flex-col items-center text-center p-8 rounded-3xl bg-white/60 backdrop-blur-lg border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 transform hover:-translate-y-2 cursor-pointer relative overflow-hidden`}
                            >
                                {/* Background glow effect on hover */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${colors.bg}`}></div>

                                <div className={`relative z-10 p-4 rounded-2xl bg-white shadow-sm mb-6 ${colors.text} ring-1 ring-gray-100 group-hover:ring-0 group-hover:scale-110 transition-all duration-300`}>
                                    <IconComponent className="w-8 h-8" />
                                </div>
                                <h4 className="relative z-10 text-xl font-extrabold mb-3 text-gray-900 tracking-tight">{feat.title}</h4>
                                <p className="relative z-10 text-gray-500 font-medium leading-relaxed" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                                    {feat.desc}
                                </p>
                                <div className={`relative z-10 mt-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 text-sm font-bold ${colors.text} flex items-center gap-2`}>
                                    Learn More <span className="text-lg">→</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
