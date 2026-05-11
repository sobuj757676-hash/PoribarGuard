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
        style={{
          position: "fixed",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10003,
          maxWidth: "90vw",
          width: "auto",
          minWidth: "280px",
        }}
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
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: 1.8,
              color: "#ffffff",
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
              fontWeight: 500,
              textAlign: "center",
              minHeight: "27px",
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
