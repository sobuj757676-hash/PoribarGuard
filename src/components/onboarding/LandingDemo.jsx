"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronRight, Smartphone, Camera, Mic, MapPin } from "lucide-react";
import MockupPhone from "./MockupPhone";
import ConversionCard from "./ConversionCard";
import SubtitleDisplay from "./SubtitleDisplay";
import StoryProgressBar from "./StoryProgressBar";
import { VoiceEngine } from "@/lib/VoiceEngine";

/**
 * LandingDemo — Full interactive demo section for the landing page.
 *
 * Two modes:
 * 1. TEASER MODE: Shows a "Watch Demo" button overlaid on the hero
 * 2. DEMO MODE: Full-screen immersive overlay with:
 *    - Simulated phone (MockupPhone)
 *    - Auto-advancing or manual feature walkthrough
 *    - Bengali subtitles with typewriter effect
 *    - Story-style progress bar
 *    - Conversion card at the end
 */

const DEMO_STEPS = [
  {
    id: "screen-view",
    feature: "screen-view",
    icon: <Smartphone className="w-5 h-5" />,
    title: "স্ক্রিন ভিউ",
    titleEn: "Screen View",
    descriptionBn:
      "আপনার অনুপস্থিতিতে আপনার সন্তান মোবাইলে কী করছে — ফেসবুক, ইউটিউব, গেম — তা এখন আপনি সরাসরি নিজের ফোনে দেখতে পাবেন।",
    color: "#818cf8",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    id: "camera",
    feature: "camera",
    icon: <Camera className="w-5 h-5" />,
    title: "লাইভ ক্যামেরা",
    titleEn: "Live Camera",
    descriptionBn:
      "সন্তানের আশেপাশের পরিবেশ দেখতে চাইলে সামনের বা পেছনের ক্যামেরা চালু করুন। ক্লাসে আছে নাকি বাইরে — এক ক্লিকেই জানুন।",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "mic",
    feature: "mic",
    icon: <Mic className="w-5 h-5" />,
    title: "অ্যাম্বিয়েন্ট মাইক",
    titleEn: "Ambient Microphone",
    descriptionBn:
      "কার সাথে কথা বলছে, বাড়ির পরিবেশ কেমন — ফোনের মাইক্রোফোন দিয়ে আশেপাশের শব্দ শুনুন।",
    color: "#3b82f6",
    gradient: "from-blue-500 to-violet-600",
  },
  {
    id: "location",
    feature: "location",
    icon: <MapPin className="w-5 h-5" />,
    title: "লাইভ লোকেশন",
    titleEn: "Live Location",
    descriptionBn:
      "রাত হয়ে গেলেও সন্তান ঘরে ফিরলো কি না — ম্যাপে সরাসরি দেখুন, ২৪ ঘণ্টা। আর দুশ্চিন্তা নয়।",
    color: "#10b981",
    gradient: "from-emerald-500 to-green-600",
  },
];

const AUTO_ADVANCE_DELAY = 7000; // 7 seconds per step

export default function LandingDemo() {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showConversion, setShowConversion] = useState(false);
  const autoPlayTimer = useRef(null);

  const currentStep = DEMO_STEPS[currentStepIndex];

  // --- Auto-advance logic ---
  useEffect(() => {
    if (!isDemoActive || !isAutoPlaying || showConversion) return;

    autoPlayTimer.current = setTimeout(() => {
      if (currentStepIndex < DEMO_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setShowConversion(true);
      }
    }, AUTO_ADVANCE_DELAY);

    return () => clearTimeout(autoPlayTimer.current);
  }, [isDemoActive, isAutoPlaying, currentStepIndex, showConversion]);

  // --- Voice-over playback & preloading ---
  useEffect(() => {
    // Preload when component mounts
    VoiceEngine.preload(DEMO_STEPS.map(s => s.id));
  }, []);

  useEffect(() => {
    if (isDemoActive && !showConversion) {
      VoiceEngine.play(DEMO_STEPS[currentStepIndex].id);
    } else if (showConversion) {
      VoiceEngine.stop();
    }
  }, [isDemoActive, currentStepIndex, showConversion]);

  // --- Manual feature click ---
  const handleFeatureClick = useCallback(
    (featureId) => {
      clearTimeout(autoPlayTimer.current);
      setIsAutoPlaying(false);
      setShowConversion(false);
      const idx = DEMO_STEPS.findIndex((s) => s.feature === featureId);
      if (idx !== -1) setCurrentStepIndex(idx);
    },
    []
  );

  const goNext = useCallback(() => {
    clearTimeout(autoPlayTimer.current);
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setIsAutoPlaying(true);
    } else {
      setShowConversion(true);
    }
  }, [currentStepIndex]);

  const startDemo = useCallback(() => {
    setIsDemoActive(true);
    setCurrentStepIndex(0);
    setIsAutoPlaying(true);
    setShowConversion(false);
    // Lock body scroll
    document.body.style.overflow = "hidden";
  }, []);

  const closeDemo = useCallback(() => {
    setIsDemoActive(false);
    setCurrentStepIndex(0);
    setShowConversion(false);
    VoiceEngine.stop();
    document.body.style.overflow = "";
  }, []);

  // Persist demo seen state
  const markDemoSeen = useCallback(() => {
    localStorage.setItem("poribar_landing_demo_seen", "true");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      clearTimeout(autoPlayTimer.current);
      VoiceEngine.stop();
    };
  }, []);

  return (
    <>
      {/* ===== TEASER BUTTON (visible on landing page) ===== */}
      <motion.button
        onClick={startDemo}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-base overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))",
          border: "1px solid rgba(16,185,129,0.3)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        />

        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="w-5 h-5 text-white ml-0.5" />
        </div>
        <div className="text-left">
          <span className="block text-emerald-400 text-[11px] font-bold uppercase tracking-wider">Interactive Demo</span>
          <span
            className="block text-white text-sm font-bold"
            style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}
          >
            দেখুন কিভাবে কাজ করে
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* ===== FULL-SCREEN DEMO OVERLAY ===== */}
      <AnimatePresence>
        {isDemoActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0a0a0a 0%, #0d1117 50%, #0a0a0a 100%)",
            }}
          >
            {/* Story Progress Bar */}
            <StoryProgressBar
              totalSteps={DEMO_STEPS.length}
              currentStep={currentStepIndex}
            />

            {/* Close / Skip button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={() => {
                closeDemo();
                markDemoSeen();
              }}
              className="absolute top-3 right-4 z-[210] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-all"
            >
              Skip <X className="w-3.5 h-3.5" />
            </motion.button>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6 py-8 overflow-y-auto">

              {/* Left Side: Feature Info + Navigation */}
              <motion.div
                key={showConversion ? "conversion" : currentStep.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="w-full md:w-[380px] flex flex-col items-center md:items-start text-center md:text-left"
              >
                {!showConversion ? (
                  <>
                    {/* Feature Icon Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentStep.gradient} flex items-center justify-center text-white shadow-lg mb-5`}
                    >
                      {currentStep.icon}
                    </motion.div>

                    {/* Step Counter */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
                        Step {currentStepIndex + 1} of {DEMO_STEPS.length}
                      </span>
                    </div>

                    {/* Bengali Title */}
                    <h2
                      className="text-2xl md:text-3xl font-black text-white mb-2"
                      style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}
                    >
                      {currentStep.title}
                    </h2>
                    <p className="text-sm text-gray-400 font-semibold mb-4">
                      {currentStep.titleEn}
                    </p>

                    {/* Bengali Description */}
                    <p
                      className="text-[15px] text-gray-300 leading-relaxed mb-8 max-w-sm"
                      style={{
                        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
                        lineHeight: 1.9,
                      }}
                    >
                      {currentStep.descriptionBn}
                    </p>

                    {/* Feature Nav Pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {DEMO_STEPS.map((step, i) => (
                        <button
                          key={step.id}
                          onClick={() => handleFeatureClick(step.feature)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                            i === currentStepIndex
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-transparent border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/15"
                          }`}
                        >
                          {step.icon}
                          {step.titleEn}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={goNext}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20"
                    >
                      {currentStepIndex === DEMO_STEPS.length - 1 ? (
                        <span style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}>
                          ফ্রি ট্রায়াল দেখুন →
                        </span>
                      ) : (
                        <span style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}>
                          পরবর্তী ফিচার →
                        </span>
                      )}
                    </motion.button>
                  </>
                ) : (
                  /* Conversion Card */
                  <ConversionCard isVisible={showConversion} />
                )}
              </motion.div>

              {/* Right Side: Mockup Phone */}
              <MockupPhone
                activeFeature={showConversion ? "idle" : currentStep.feature}
                onFeatureClick={handleFeatureClick}
              />
            </div>

            {/* Bottom Subtitle (Bengali) */}
            {!showConversion && (
              <SubtitleDisplay
                text={currentStep.descriptionBn}
                stepId={currentStep.id}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
