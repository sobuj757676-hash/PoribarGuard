"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SpotlightOverlay from "./SpotlightOverlay";
import StoryProgressBar from "./StoryProgressBar";
import SubtitleDisplay from "./SubtitleDisplay";
import HandPointer from "./HandPointer";
import SuccessCelebration from "./SuccessCelebration";
import { VoiceEngine } from "@/lib/VoiceEngine";

/**
 * GhostGuide — Main orchestrator for the post-login onboarding tour.
 *
 * Manages:
 * - Step navigation (Next / Back / Skip)
 * - Target element discovery via data-guide-id
 * - Spotlight positioning (recalculates on scroll/resize)
 * - Progress tracking (story-style bar)
 * - Bengali subtitles with typewriter effect
 * - Completion celebration with confetti
 * - Persistence (localStorage) for first-run / resume logic
 */

const STORAGE_KEY = "poribar_guide_completed";
const RESUME_KEY = "poribar_guide_step";

export default function GhostGuide({ steps, onComplete }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const resizeObserver = useRef(null);
  const rafRef = useRef(null);

  // --- Mount & First-Run Check ---
  useEffect(() => {
    setHasMounted(true);

    // Check if guide was already completed
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed === "true") {
      setIsActive(false);
      return;
    }

    // Check for resume point
    const savedStep = localStorage.getItem(RESUME_KEY);
    const resumeIdx = savedStep ? parseInt(savedStep, 10) : 0;

    // Wait for the first target element to appear in the DOM
    // This prevents the guide from starting on empty "no children" dashboards
    let attempts = 0;
    const maxAttempts = 20; // 20 * 500ms = 10 seconds max wait

    const pollForTargets = setInterval(() => {
      attempts++;
      const firstStep = steps[resumeIdx] || steps[0];
      const targetEl = firstStep
        ? document.querySelector(firstStep.targetSelector)
        : null;

      if (targetEl) {
        clearInterval(pollForTargets);
        setCurrentStepIndex(resumeIdx);
        setIsActive(true);
        // Preload all audio files
        VoiceEngine.preload(steps.map(s => s.id));
      } else if (attempts >= maxAttempts) {
        clearInterval(pollForTargets);
        // Target never appeared — don't start guide
      }
    }, 500);

    return () => clearInterval(pollForTargets);
  }, [steps]);

  // --- Voice-over playback ---
  useEffect(() => {
    if (isActive && steps[currentStepIndex]) {
      VoiceEngine.play(steps[currentStepIndex].id);
    }
    
    return () => {
      if (!isActive) VoiceEngine.stop();
    };
  }, [isActive, currentStepIndex, steps]);

  // --- Target Element Discovery ---
  const findTarget = useCallback(() => {
    if (!isActive || !steps[currentStepIndex]) return;

    const step = steps[currentStepIndex];
    const el = document.querySelector(step.targetSelector);

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStepIndex, steps]);

  // Recalculate on scroll/resize + observe layout changes
  useEffect(() => {
    if (!isActive) return;

    findTarget();

    const handleUpdate = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(findTarget);
    };

    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);

    // Use ResizeObserver on the target for layout shifts
    const step = steps[currentStepIndex];
    if (step) {
      const el = document.querySelector(step.targetSelector);
      if (el && typeof ResizeObserver !== "undefined") {
        resizeObserver.current = new ResizeObserver(handleUpdate);
        resizeObserver.current.observe(el);
      }
    }

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeObserver.current) resizeObserver.current.disconnect();
    };
  }, [isActive, currentStepIndex, findTarget, steps]);

  // --- Save resume point on step change ---
  useEffect(() => {
    if (isActive) {
      localStorage.setItem(RESUME_KEY, String(currentStepIndex));
    }
  }, [currentStepIndex, isActive]);

  // --- Navigation Handlers ---
  const goNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Guide complete
      setIsActive(false);
      setShowCelebration(true);
      localStorage.setItem(STORAGE_KEY, "true");
      localStorage.removeItem(RESUME_KEY);
    }
  }, [currentStepIndex, steps.length]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const skip = useCallback(() => {
    setIsActive(false);
    VoiceEngine.stop();
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.removeItem(RESUME_KEY);
    onComplete?.();
  }, [onComplete]);

  // Public method to restart guide
  const restart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RESUME_KEY);
    setCurrentStepIndex(0);
    setShowCelebration(false);
    // Small delay to let state settle
    setTimeout(() => setIsActive(true), 100);
  }, []);

  // Expose restart via ref
  useEffect(() => {
    window.__poribarGuideRestart = restart;
    return () => { delete window.__poribarGuideRestart; };
  }, [restart]);

  const handleCelebrationDismiss = useCallback(() => {
    setShowCelebration(false);
    VoiceEngine.stop();
    onComplete?.();
  }, [onComplete]);

  if (!hasMounted) return null;

  const currentStep = steps[currentStepIndex];

  return (
    <>
      {/* Celebration Overlay */}
      <SuccessCelebration
        isVisible={showCelebration}
        onDismiss={handleCelebrationDismiss}
      />

      {/* Guide Active State */}
      <AnimatePresence>
        {isActive && currentStep && (
          <>
            {/* Story Progress Bar */}
            <StoryProgressBar
              totalSteps={steps.length}
              currentStep={currentStepIndex}
            />

            {/* Spotlight Overlay */}
            <SpotlightOverlay
              targetRect={targetRect}
              isVisible={isActive}
              onClick={() => {}} // Don't dismiss on overlay click
            />

            {/* Hand Pointer */}
            <HandPointer targetRect={targetRect} />

            {/* Bengali Subtitle */}
            <SubtitleDisplay
              text={currentStep.descriptionBn}
              stepId={currentStep.id}
            />

            {/* Tooltip Card (near the spotlight) */}
            {targetRect && (
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                  delay: 0.15,
                }}
                style={{
                  position: "fixed",
                  zIndex: 10005,
                  ...(currentStep.tooltipPosition === "top"
                    ? {
                        bottom:
                          window.innerHeight -
                          targetRect.top +
                          20,
                        left: Math.max(
                          16,
                          Math.min(
                            targetRect.left +
                              targetRect.width / 2 -
                              160,
                            window.innerWidth - 336
                          )
                        ),
                      }
                    : {
                        top:
                          targetRect.top + targetRect.height + 20,
                        left: Math.max(
                          16,
                          Math.min(
                            targetRect.left +
                              targetRect.width / 2 -
                              160,
                            window.innerWidth - 336
                          )
                        ),
                      }),
                  width: "320px",
                  maxWidth: "calc(100vw - 32px)",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow:
                      "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(16,185,129,0.15)",
                  }}
                >
                  {/* Step indicator & icon */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>
                        {currentStep.icon}
                      </span>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            fontWeight: 800,
                            color: "#111827",
                          }}
                        >
                          {currentStep.title}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#10b981",
                            fontFamily:
                              "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
                          }}
                        >
                          {currentStep.titleBn}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        background: "#f3f4f6",
                        padding: "3px 10px",
                        borderRadius: "99px",
                      }}
                    >
                      {currentStepIndex + 1}/{steps.length}
                    </span>
                  </div>

                  {/* English Description */}
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "#4b5563",
                    }}
                  >
                    {currentStep.description}
                  </p>

                  {/* Navigation Buttons */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    {/* Skip */}
                    <button
                      onClick={skip}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "12px",
                        color: "#9ca3af",
                        cursor: "pointer",
                        padding: "6px 0",
                        fontWeight: 600,
                      }}
                    >
                      এড়িয়ে যান
                    </button>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {/* Back */}
                      {currentStepIndex > 0 && (
                        <button
                          onClick={goBack}
                          style={{
                            background: "#f3f4f6",
                            border: "none",
                            borderRadius: "12px",
                            padding: "8px 16px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#6b7280",
                            cursor: "pointer",
                          }}
                        >
                          ← Back
                        </button>
                      )}

                      {/* Next / Finish */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={goNext}
                        style={{
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                          border: "none",
                          borderRadius: "12px",
                          padding: "8px 20px",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "white",
                          cursor: "pointer",
                          boxShadow:
                            "0 4px 12px rgba(16,185,129,0.3)",
                        }}
                      >
                        {currentStepIndex === steps.length - 1
                          ? "সম্পন্ন ✓"
                          : "পরবর্তী →"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Top-right Skip Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1 }}
              onClick={skip}
              style={{
                position: "fixed",
                top: "24px",
                right: "16px",
                zIndex: 10006,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "99px",
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
            >
              Skip Guide ✕
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
