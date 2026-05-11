"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

/**
 * HelpBubble — Floating "?" icon in bottom-right corner.
 * Pulsing green glow animation. Tapping re-triggers the Ghost Guide.
 * Shown after guide completion.
 */
export default function HelpBubble({ onClick }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label="Re-open guide"
      style={{
        position: "fixed",
        bottom: "160px",
        right: "20px",
        zIndex: 90,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #10b981, #059669)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
        padding: 0,
      }}
    >
      {/* Pulsing ring */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0px rgba(16,185,129,0.4)",
            "0 0 0 10px rgba(16,185,129,0)",
            "0 0 0 0px rgba(16,185,129,0.4)",
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <HelpCircle
        style={{
          width: "22px",
          height: "22px",
          color: "white",
          strokeWidth: 2.5,
        }}
      />
    </motion.button>
  );
}
