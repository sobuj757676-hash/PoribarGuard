"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SuccessCelebration — Animated completion card with CSS confetti.
 * Shows Bengali congratulations message after guide completion.
 * Auto-dismisses after 5 seconds or on tap.
 */
export default function SuccessCelebration({ isVisible, onDismiss }) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    // Generate confetti particles
    const particles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 2,
      size: Math.random() * 8 + 4,
      color: [
        "#10b981", "#34d399", "#fbbf24", "#f59e0b",
        "#818cf8", "#a78bfa", "#fb7185", "#38bdf8",
      ][Math.floor(Math.random() * 8)],
      rotation: Math.random() * 360,
    }));
    setConfetti(particles);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onDismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10010,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        {/* Confetti Particles */}
        {confetti.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: `${p.x}vw`,
              y: "-10vh",
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y: "110vh",
              rotate: p.rotation + 720,
              opacity: [1, 1, 0.5, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "linear",
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.size > 7 ? "2px" : "50%",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Celebration Card */}
        <motion.div
          initial={{ scale: 0.7, y: 60, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 22,
            delay: 0.2,
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            maxWidth: "380px",
            width: "90vw",
            background: "linear-gradient(145deg, rgba(16,185,129,0.15), rgba(6,78,59,0.2))",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "28px",
            padding: "40px 32px 32px",
            textAlign: "center",
            border: "1px solid rgba(16,185,129,0.3)",
            boxShadow: "0 0 60px rgba(16,185,129,0.15), 0 20px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(16,185,129,0.25), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Trophy / Celebration Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "56px", marginBottom: "16px", position: "relative" }}
          >
            🎉
          </motion.div>

          {/* Bengali Title */}
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 8px",
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
              lineHeight: 1.4,
            }}
          >
            অভিনন্দন!
          </h2>

          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.85)",
              margin: "0 0 24px",
              lineHeight: 1.7,
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            }}
          >
            আপনি এখন পরিবার গার্ড ব্যবহার করতে সম্পূর্ণ প্রস্তুত।
          </p>

          {/* Dismiss Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDismiss}
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "12px 32px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            }}
          >
            শুরু করুন ✨
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
