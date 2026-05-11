"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";

/**
 * ConversionCard — The final "trust push" card shown at the end
 * of the landing page interactive demo. Emotional Bengali CTA
 * leading to the 7-Day Free Trial signup.
 */
export default function ConversionCard({ isVisible }) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
      className="w-full max-w-sm mx-auto relative z-10"
    >
      {/* Luminous Highlight behind card */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full -z-10"
      />
      <div
        style={{
          background: "linear-gradient(145deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "28px",
          padding: "32px 24px",
          border: "1px solid rgba(16,185,129,0.3)",
          boxShadow: "0 0 80px rgba(16,185,129,0.15), 0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Shield Icon */}
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center"
          >
            <Shield className="w-7 h-7 text-emerald-400" />
          </motion.div>
        </div>

        {/* Bengali Heading */}
        <h3
          className="text-center mb-2"
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#ffffff",
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            lineHeight: 1.4,
          }}
        >
          এখনই শুরু করুন — সম্পূর্ণ ফ্রি!
        </h3>

        <p
          className="text-center mb-6"
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.7)",
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            lineHeight: 1.7,
          }}
        >
          ৭ দিন ফ্রি ট্রায়াল — কোনো কার্ড লাগবে না।
        </p>

        {/* Trust Points */}
        <div className="space-y-2 mb-6">
          {[
            "১ মিনিটে সেটআপ সম্পন্ন",
            "সন্তানের ফোনে ইনস্টল করুন",
            "১০০% গোপনীয়তা নিশ্চিত",
          ].map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
                }}
              >
                {point}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="relative mt-2">
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              animate={{ boxShadow: ["0 4px 20px rgba(16,185,129,0.4)", "0 4px 30px rgba(16,185,129,0.8)", "0 4px 20px rgba(16,185,129,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm z-10"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
              }}
            >
              ৭ দিন ফ্রি ট্রায়াল শুরু করুন
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>

          {/* Hand Pointer Animation targeting the CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 10, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 1, duration: 0.5, type: "spring" }}
            className="absolute -bottom-8 -right-4 z-20 pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          >
            <motion.div
              animate={{ y: [0, -6, 0], scale: [1, 0.95, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 14.5L5.5 12.5C4.95 11.95 4.95 11.05 5.5 10.5C6.05 9.95 6.95 9.95 7.5 10.5L9 12V5.5C9 4.67 9.67 4 10.5 4C11.33 4 12 4.67 12 5.5V10L13 9.5C13.83 9.08 14.83 9.42 15.25 10.25L18 16C18 16 18.5 20 14.5 20H10.5C8.5 20 7 18.5 7 16.5L7.5 14.5Z" fill="white" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Tap Ripple */}
              <motion.div
                animate={{ scale: [0.5, 2], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute top-[-4px] left-[-4px] w-6 h-6 border-2 border-emerald-400 rounded-full"
              />
            </motion.div>
          </motion.div>
        </div>

        <p className="text-center mt-3 text-[11px] text-gray-500">
          No credit card required • Cancel anytime
        </p>
      </div>
    </motion.div>
  );
}
