"use client";

import { motion } from "framer-motion";

/**
 * StoryProgressBar — Instagram/Facebook Stories-style segmented progress bar.
 * Fixed at the top of the viewport during the onboarding guide.
 */
export default function StoryProgressBar({ totalSteps, currentStep }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10002,
        display: "flex",
        gap: "4px",
        padding: "8px 16px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
      }}
    >
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: "3px",
            borderRadius: "99px",
            background: "rgba(255,255,255,0.25)",
            overflow: "hidden",
          }}
        >
          {i < currentStep ? (
            /* Completed segment */
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "99px",
                background: "#10b981",
              }}
            />
          ) : i === currentStep ? (
            /* Active segment — animated fill */
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 6, ease: "linear" }}
              style={{
                height: "100%",
                borderRadius: "99px",
                background: "linear-gradient(90deg, #10b981, #34d399)",
                boxShadow: "0 0 8px rgba(16,185,129,0.6)",
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
