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
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full max-w-sm mx-auto"
    >
      <div
        style={{
          background: "linear-gradient(145deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "28px",
          padding: "32px 24px",
          border: "1px solid rgba(16,185,129,0.2)",
          boxShadow: "0 0 60px rgba(16,185,129,0.1), 0 20px 60px rgba(0,0,0,0.2)",
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
        <Link href="/register">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 20px rgba(16,185,129,0.4), 0 0 0 1px rgba(16,185,129,0.2)",
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            }}
          >
            ৭ দিন ফ্রি ট্রায়াল শুরু করুন
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>

        <p className="text-center mt-3 text-[11px] text-gray-500">
          No credit card required • Cancel anytime
        </p>
      </div>
    </motion.div>
  );
}
