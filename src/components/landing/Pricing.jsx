"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from 'next/link';

export default function Pricing() {
    const tiers = [
        {
            name: "Standard",
            price: "৳299",
            desc: "Basic safety for one child",
            features: ["Live Location Tracking", "Geofence Alerts (School/Home)", "Daily Screen Time Reports", "SOS Button Access"],
            highlight: false,
            btnText: "Start Free Trial"
        },
        {
            name: "Premium",
            price: "৳599",
            desc: "Most Popular! Best for ultimate peace of mind.",
            features: ["Everything in Standard", "Live Camera & Mic On-Demand", "Live Screen Viewing", "Prayer Time Auto-Lock", "App Blocking (TikTok, FreeFire)"],
            highlight: true,
            btnText: "Start 7-Day Free Trial"
        },
        {
            name: "Ultimate",
            price: "৳899",
            desc: "For multiple children & strict control",
            features: ["Everything in Premium", "Device Owner Mode (Uninstall block)", "Remote Wipe Data", "Priority 24/7 Phone Support", "Up to 3 Children"],
            highlight: false,
            btnText: "Start Free Trial"
        }
    ];

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                            সাশ্রয়ী মূল্যে পরিবারের নিরাপত্তা
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 font-medium">
                            Pay securely via bKash, Nagad, or any International Card.
                            <span className="block mt-2 font-bold text-emerald-600 bg-emerald-100 inline-block px-4 py-1 rounded-full text-sm">Save 20% on Annual Plans (2 months FREE)</span>
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className={`relative bg-white rounded-3xl p-8 flex flex-col ${tier.highlight ? 'border-2 border-emerald-500 shadow-2xl scale-100 md:scale-105 z-10' : 'border border-gray-200 shadow-lg'}`}
                        >
                            {tier.highlight && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white font-black text-sm uppercase tracking-wide px-6 py-1.5 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8 text-center pb-8 border-b border-gray-100">
                                <h3 className={`text-2xl font-bold mb-2 ${tier.highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{tier.name}</h3>
                                <p className="text-gray-500 text-sm mb-6 h-10">{tier.desc}</p>
                                <div className="flex justify-center items-end gap-1">
                                    <span className="text-4xl font-black text-gray-900">{tier.price}</span>
                                    <span className="text-gray-500 font-medium mb-1">/month</span>
                                </div>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {tier.features.map((feat, fIdx) => (
                                    <li key={fIdx} className="flex items-start gap-3">
                                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.highlight ? 'text-emerald-500' : 'text-gray-400'}`} />
                                        <span className="text-gray-700 font-medium">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/register" className={`w-full text-center py-4 rounded-xl font-bold text-lg transition-transform hover:-translate-y-1 ${tier.highlight ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
                                {tier.btnText}
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Payment Badges */}
                <div className="mt-16 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Supported Payments</p>
                    <div className="flex justify-center items-center gap-4 flex-wrap">
                        <span className="px-4 py-2 bg-pink-600 text-white font-bold rounded-lg text-sm shadow">bKash</span>
                        <span className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg text-sm shadow">Nagad</span>
                        <span className="px-4 py-2 bg-purple-700 text-white font-bold rounded-lg text-sm shadow">Rocket</span>
                        <span className="px-4 py-2 bg-blue-900 text-white font-bold rounded-lg text-sm shadow hidden sm:block">Visa / Mastercard</span>
                    </div>
                    <p className="mt-8 opacity-75 text-sm text-gray-500 font-medium">Start Free 7-Day Trial – No Card Needed</p>
                </div>

            </div>
        </section>
    );
}
