"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
    const faqs = [
        {
            q: "Is it completely legal to install this app?",
            a: "Yes. In Bangladesh, as a parent or legal guardian, it is completely legal to monitor the devices of your minor children (under 18) for their safety and digital wellbeing."
        },
        {
            q: "আমি কি প্রবাস থেকে এটি সেটআপ করতে পারব?",
            a: "জি, ১০০%। আপনি শুধু আমাদের Magic SMS লিঙ্কটি সন্তানের ফোনে পাঠাবেন। সে লিঙ্কে ক্লিক করলেই অ্যাপটি স্বয়ংক্রিয়ভাবে ইন্সটল হয়ে যাবে। কোন টেকনিক্যাল জ্ঞানের প্রয়োজন নেই।"
        },
        {
            q: "Can the child uninstall the PoribarGuard app?",
            a: "If you subscribe to the Ultimate plan, you can enable 'Device Owner Mode' which completely prevents the child from uninstalling or disabling the app without your secure PIN."
        },
        {
            q: "গ্রামের বাজে ইন্টারনেট স্পিডে কি এটা কাজ করবে?",
            a: "হ্যাঁ। লোকেশন এবং ছোট টেক্সট অ্যালার্টগুলো 2G/3G নেটওয়ার্কেও কাজ করবে। তবে লাইভ ভিডিও বা স্ক্রিন দেখার জন্য একটি মাঝারি মানের 4G বা ওয়াইফাই সংযোগ প্রয়োজন।"
        },
        {
            q: "How does the Prayer Time Auto Lock work?",
            a: "The system syncs with local Bangladesh prayer times. You can select specific prayers (e.g., Maghrib). During that time window, the child's phone screen will be locked automatically, forcing them to pray or study."
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <FAQItem key={idx} question={faq.q} answer={faq.a} />
                    ))}
                </div>

            </div>
        </section>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
            >
                <span className="font-bold text-gray-900 text-lg pr-4" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>{question}</span>
                <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-6 text-gray-600 font-medium" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                            <div className="pt-2 border-t border-gray-200/50">
                                {answer}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
