"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const defaultTestimonials = [
    { name: 'Rahim Chowdhury', location: '🇦🇪 Dubai, UAE', text: 'ভাই, এটা আসলেই ম্যাজিক। আমি দুবাই বসে আমার ছেলের স্কুল, টিউশন সব ট্র্যাক করি। সন্তানের ফোনে কী হচ্ছে, সব দেখতে পারি।', rating: 5, imgUrl: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Fatema Begum', location: '🇸🇦 Riyadh, KSA', text: 'প্রথম দিকে ভাবছিলাম কীভাবে সেটআপ করব, কিন্তু Magic Link এ ক্লিক করালেই হয়ে গেল। SOS বাটন সেভ করেছে আমার মেয়েকে।', rating: 5, imgUrl: 'https://i.pravatar.cc/150?img=5' },
    { name: 'Kamrul Hasan', location: '🇬🇧 London, UK', text: 'The auto-lock feature during Maghrib is exactly what we needed. My son now prays on time without me nagging. Worth every taka.', rating: 5, imgUrl: 'https://i.pravatar.cc/150?img=12' }
];

export default function SocialProof({ config }) {
    const sectionTitle = config?.sectionTitle || 'যারা ইতিমধ্যে ব্যবহার করছেন';
    const statBadge = config?.statBadge || '2,347+ Probashi Families Protected';
    const testimonials = config?.testimonials?.length > 0 ? config.testimonials : defaultTestimonials;

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                            {sectionTitle}
                        </h2>
                        <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 px-6 py-2 rounded-full">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="font-bold text-emerald-700 text-sm">{statBadge}</span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition"
                        >
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(t.rating || 5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 text-lg font-medium mb-8 leading-relaxed" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                                &ldquo;{t.text}&rdquo;
                            </p>
                            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                                <img src={t.imgUrl || 'https://i.pravatar.cc/150?img=1'} alt={t.name} className="w-12 h-12 rounded-full border-2 border-emerald-200 shadow-sm" />
                                <div>
                                    <p className="font-bold text-gray-900">{t.name}</p>
                                    <p className="text-sm text-gray-500">{t.location}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
