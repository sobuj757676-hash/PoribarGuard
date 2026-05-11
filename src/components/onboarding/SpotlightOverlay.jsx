"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SpotlightOverlay — Full-screen glassmorphic overlay with a dynamic
 * SVG-based spotlight cut-out that highlights target elements.
 * 
 * Features:
 * - Frosted glass background (backdrop-filter blur)
 * - SVG mask creates a rounded-rect "hole" over the target
 * - Luminous glow ring around the cut-out
 * - Breathing (pulse) animation on the target
 * - Spring-physics transitions between targets
 */
export default function SpotlightOverlay({
  targetRect,
  isVisible,
  onClick,
  padding = 8,
  borderRadius = 16,
}) {
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });

  // Track window size for SVG dimensions
  useEffect(() => {
    const update = () =>
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!isVisible || !windowSize.w) return null;

  // Compute spotlight rect with padding
  const sx = (targetRect?.left ?? 0) - padding;
  const sy = (targetRect?.top ?? 0) - padding;
  const sw = (targetRect?.width ?? 0) + padding * 2;
  const sh = (targetRect?.height ?? 0) + padding * 2;
  const sr = borderRadius;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onClick}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            cursor: "pointer",
          }}
        >
          {/* SVG Overlay with mask cut-out */}
          <svg
            width={windowSize.w}
            height={windowSize.h}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <defs>
              {/* Mask: white = visible overlay, black = cut-out */}
              <mask id="spotlight-mask">
                <rect
                  x="0"
                  y="0"
                  width={windowSize.w}
                  height={windowSize.h}
                  fill="white"
                />
                {targetRect && (
                  <motion.rect
                    initial={false}
                    animate={{
                      x: sx,
                      y: sy,
                      width: sw,
                      height: sh,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 28,
                      mass: 0.8,
                    }}
                    rx={sr}
                    ry={sr}
                    fill="black"
                  />
                )}
              </mask>

              {/* Glow filter for the ring */}
              <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feFlood floodColor="#10b981" floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Dark frosted overlay */}
            <rect
              x="0"
              y="0"
              width={windowSize.w}
              height={windowSize.h}
              fill="rgba(0, 0, 0, 0.65)"
              mask="url(#spotlight-mask)"
            />

            {/* Luminous glow ring around spotlight */}
            {targetRect && (
              <motion.rect
                initial={false}
                animate={{
                  x: sx - 3,
                  y: sy - 3,
                  width: sw + 6,
                  height: sh + 6,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 28,
                  mass: 0.8,
                }}
                rx={sr + 2}
                ry={sr + 2}
                fill="none"
                stroke="rgba(16, 185, 129, 0.5)"
                strokeWidth="2"
                filter="url(#glow-filter)"
              />
            )}
          </svg>

          {/* Backdrop blur layer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              pointerEvents: "none",
              mask: "url(#spotlight-mask)",
              WebkitMask: "url(#spotlight-mask)",
            }}
          />

          {/* Breathing glow animation ring (CSS-based, on top of SVG) */}
          {targetRect && (
            <motion.div
              initial={false}
              animate={{
                left: sx - 4,
                top: sy - 4,
                width: sw + 8,
                height: sh + 8,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
                mass: 0.8,
              }}
              style={{
                position: "fixed",
                borderRadius: sr + 4,
                pointerEvents: "none",
                zIndex: 10001,
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0px rgba(16,185,129,0.3), 0 0 20px 4px rgba(16,185,129,0.15)",
                    "0 0 0 4px rgba(16,185,129,0.15), 0 0 30px 8px rgba(16,185,129,0.1)",
                    "0 0 0 0px rgba(16,185,129,0.3), 0 0 20px 4px rgba(16,185,129,0.15)",
                  ],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "inherit",
                  border: "1.5px solid rgba(16,185,129,0.25)",
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
