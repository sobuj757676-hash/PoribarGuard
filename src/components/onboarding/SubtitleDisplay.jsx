"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SubtitleDisplay — Bottom-of-screen subtitle pill with typewriter effect.
 * Shows Bengali description of the current onboarding step.
 */
export default function SubtitleDisplay({ text, stepId }) {
  const [displayedWords, setDisplayedWords] = useState([]);
  const words = text ? text.split(" ") : [];

  useEffect(() => {
    setDisplayedWords([]);
    if (!text) return;

    const wordArr = text.split(" ");
    let idx = 0;

    const interval = setInterval(() => {
      if (idx < wordArr.length) {
        setDisplayedWords((prev) => [...prev, wordArr[idx]]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [text, stepId]);

  if (!text) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed bottom-6 md:bottom-24 left-1/2 -translate-x-1/2 z-[10003] max-w-[95vw] md:max-w-[90vw] w-auto min-w-[280px]"
      >
        <div
          style={{
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "20px",
            padding: "14px 24px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <p
            className="m-0 text-base md:text-lg leading-relaxed text-white text-center min-h-[27px] font-medium"
            style={{
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            }}
          >
            {displayedWords.map((word, i) => (
              <motion.span
                key={`${stepId}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: "inline", marginRight: "5px" }}
              >
                {word}
              </motion.span>
            ))}
            {displayedWords.length < words.length && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ display: "inline-block", color: "#34d399" }}
              >
                ▎
              </motion.span>
            )}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
