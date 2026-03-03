"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function SocialProof() {
    const testimonials = [
        {
            name: "Rahim Chowdhury",
            location: "🇦🇪 Dubai, UAE",
            text: "ভাই, এটা আসলেই ম্যাজিক। আমি দুবাই বসে দেখি আমার ছেলে সন্ধ্যায় কোচিং থেকে কখন বাড়ি ফিরলো। কোন টেনশন নাই আর।",
            rating: 5,
            img: "https://i.pravatar.cc/150?img=11"
        },
        {
            name: "Fatema Begum",
            location: "🇸🇦 Riyadh, KSA",
            text: "প্রথম দিকে ভাবছিলাম কীভাবে সেটআপ করব, কিন্তু Magic SMS Link দিয়ে এক মিনিটেই হয়ে গেছে। আলহামদুলিল্লাহ, এখন আমি শান্তিতে ডিউটি করি।",
            rating: 5,
            img: "https://i.pravatar.cc/150?img=5"
        },
        {
            name: "Kamrul Hasan",
            location: "🇬🇧 London, UK",
            text: "I was worried about my daughter using the phone during study hours. The auto-lock feature is exactly what we needed. Best BD app.",
            rating: 5,
            img: "https://i.pravatar.cc/150?img=12"
        }
    ];

    return (
        <section className="py-24 bg-emerald-950 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                            যারা ইতিমধ্যে ব্যবহার করছেন
                        </h2>
                        <div className="inline-flex items-center gap-2 bg-emerald-900/50 px-6 py-2 rounded-full border border-emerald-800">
                            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="font-bold tracking-wide">2,347+ Probashi Families Protected</span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((test, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="bg-emerald-900/40 border border-emerald-800/50 p-8 rounded-3xl hover:bg-emerald-800/60 transition-colors"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(test.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                            </div>
                            <p className="text-emerald-50 text-lg mb-8 italic" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                                "{test.text}"
                            </p>
                            <div className="flex items-center gap-4 mt-auto">
                                <img src={test.img} alt={test.name} className="w-12 h-12 rounded-full border-2 border-emerald-500" />
                                <div>
                                    <h4 className="font-bold text-white">{test.name}</h4>
                                    <p className="text-sm text-emerald-400 font-medium">{test.location}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Featured Logos Mock */}
                <div className="mt-20 pt-10 border-t border-emerald-900 flex flex-col items-center">
                    <p className="text-sm text-emerald-500 font-bold uppercase tracking-widest mb-6">As featured in</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-2xl font-black font-serif">Prothom Alo</span>
                        <span className="text-2xl font-black font-serif">Daily Star</span>
                        <span className="text-xl font-bold">Probashi FB Groups</span>
                        <span className="text-2xl font-black font-serif">Somoy TV</span>
                    </div>
                </div>

            </div>
        </section>
    );
}
