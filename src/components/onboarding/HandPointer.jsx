"use client";

import { motion } from "framer-motion";

/**
 * HandPointer — Animated minimalist hand/pointer that performs a tap gesture.
 * Positioned near the spotlight target to indicate "click here".
 */
export default function HandPointer({ targetRect }) {
  if (!targetRect) return null;

  const x = targetRect.left + targetRect.width / 2 + 10;
  const y = targetRect.top + targetRect.height + 12;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 10004,
        pointerEvents: "none",
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
      }}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* SVG Hand Pointer Icon */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Drop shadow filter */}
          <defs>
            <filter id="hand-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="1" />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feFlood floodColor="#10b981" floodOpacity="0.5" />
              <feComposite operator="in" in2="SourceGraphic" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M7.5 14.5L5.5 12.5C4.95 11.95 4.95 11.05 5.5 10.5C6.05 9.95 6.95 9.95 7.5 10.5L9 12V5.5C9 4.67 9.67 4 10.5 4C11.33 4 12 4.67 12 5.5V10L13 9.5C13.83 9.08 14.83 9.42 15.25 10.25L18 16C18 16 18.5 20 14.5 20H10.5C8.5 20 7 18.5 7 16.5L7.5 14.5Z"
            fill="white"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#hand-glow)"
          />
        </svg>

        {/* Tap ripple effect */}
        <motion.div
          animate={{
            scale: [0.5, 1.8],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            top: -6,
            left: 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid rgba(16, 185, 129, 0.6)",
            pointerEvents: "none",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
