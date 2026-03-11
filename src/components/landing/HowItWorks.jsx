"use client";

import { motion } from "framer-motion";
import { UserPlus, Send, BarChart3 } from "lucide-react";

const defaultSteps = [
    { title: 'Sign Up & Pay', desc: 'Create account securely using bKash, Nagad, or International Cards with instant verification.' },
    { title: 'Send Magic Link', desc: 'Send the custom SMS link to your child\'s phone in Bangladesh. It auto-installs in stealth mode instantly.' },
    { title: 'Monitor Silently', desc: 'Open dashboard from Dubai, London, or Riyadh. Start tracking live location, camera, screen and more.' }
];

const stepIcons = [UserPlus, Send, BarChart3];

export default function HowItWorks({ config }) {
    const sectionTitle = config?.sectionTitle || '৩ মিনিটে শুরু করুন';
    const sectionSubtitle = config?.sectionSubtitle || 'No technical skills needed. Setup from anywhere in the world.';
    const steps = config?.steps?.length > 0 ? config.steps : defaultSteps;

    return (
        <section className="py-24 bg-gray-900 text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                            {sectionTitle}
                        </h2>
                        <p className="mt-4 text-xl text-gray-300 font-medium">
                            {sectionSubtitle}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connector line */}
                    <div className="hidden md:block absolute top-1/3 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                    {steps.map((step, idx) => {
                        const Icon = stepIcons[idx] || BarChart3;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="text-center relative"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-600/20 border-2 border-emerald-500 mb-6 relative">
                                    <Icon className="w-10 h-10 text-emerald-400" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-black shadow-lg">
                                        {idx + 1}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                                <p className="text-gray-300 font-medium max-w-xs mx-auto leading-relaxed">
                                    {step.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
