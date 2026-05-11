"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Camera, Mic, MapPin, Volume2, VolumeX,
} from "lucide-react";

/**
 * MockupPhone — Simulated phone showing PoribarGuard app interface.
 * Features "Magic Mirror" effect: clicking feature buttons changes
 * the phone screen with blur-to-clear transitions.
 */

const SCREEN_STATES = {
  idle: {
    bg: "bg-gray-900",
    label: "PoribarGuard",
    sublabel: "Touch a feature to preview",
  },
  "screen-view": {
    bg: "bg-indigo-950",
    label: "Screen View Active",
    sublabel: "Viewing child's screen...",
    color: "#818cf8",
  },
  camera: {
    bg: "bg-gray-900",
    label: "Camera Connected",
    sublabel: "Front camera — LIVE",
    color: "#10b981",
  },
  mic: {
    bg: "bg-blue-950",
    label: "Listening...",
    sublabel: "Ambient microphone active",
    color: "#3b82f6",
  },
  location: {
    bg: "bg-emerald-950",
    label: "Location Tracking",
    sublabel: "Real-time GPS active",
    color: "#10b981",
  },
};

export default function MockupPhone({ activeFeature, onFeatureClick }) {
  const [showContent, setShowContent] = useState(false);
  const state = SCREEN_STATES[activeFeature] || SCREEN_STATES.idle;

  useEffect(() => {
    setShowContent(false);
    const timer = setTimeout(() => setShowContent(true), 400);
    return () => clearTimeout(timer);
  }, [activeFeature]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
      className="relative flex-shrink-0 origin-top lg:origin-center scale-90 sm:scale-100"
    >
      {/* Glow behind phone */}
      <motion.div
        animate={{
          boxShadow: activeFeature
            ? `0 0 80px 20px ${state.color || "rgba(16,185,129,0.2)"}`
            : "0 0 60px 10px rgba(16,185,129,0.15)",
        }}
        transition={{ duration: 1 }}
        className="absolute inset-0 rounded-[3rem] pointer-events-none"
      />

      {/* Phone Frame */}
      <div className="relative w-[250px] h-[500px] md:w-[280px] md:h-[560px] bg-gray-900 rounded-[2.5rem] border-[6px] border-gray-800 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
          <div className="w-28 h-6 bg-gray-800 rounded-b-2xl" />
        </div>

        {/* Status Bar */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-between items-center px-5 z-40 text-[9px] text-white/60 font-medium">
          <span>12:00</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 border border-white/40 rounded-sm" />
            <div className="w-2.5 h-2.5 bg-white/60 rounded-sm" />
          </div>
        </div>

        {/* App Header */}
        <div className="relative z-30 mt-6 px-4 py-3 bg-emerald-600 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm border border-white/30">
            A
          </div>
          <div>
            <p className="text-[9px] text-emerald-100 uppercase font-bold tracking-widest">Live Monitoring</p>
            <p className="font-extrabold text-xs text-white">Tracking Ayaan</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
          </div>
        </div>

        {/* Dynamic Screen Content */}
        <div className={`relative flex-1 h-[calc(100%-140px)] ${state.bg} transition-colors duration-500`}>
          <AnimatePresence mode="wait">
            {/* Idle State */}
            {(!activeFeature || activeFeature === "idle") && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Smartphone className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-bold text-sm">{state.label}</p>
                <p className="text-gray-500 text-[10px] mt-1">{state.sublabel}</p>
              </motion.div>
            )}

            {/* Screen View */}
            {activeFeature === "screen-view" && (
              <motion.div
                key="screen"
                initial={{ opacity: 0, filter: "blur(20px)" }}
                animate={{ opacity: showContent ? 1 : 0.3, filter: showContent ? "blur(0px)" : "blur(20px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                {/* Simulated child's screen with apps */}
                <div className="p-4 grid grid-cols-3 gap-3 mt-4">
                  {[
                    { color: "bg-blue-500", name: "Facebook" },
                    { color: "bg-green-500", name: "WhatsApp" },
                    { color: "bg-red-500", name: "YouTube" },
                    { color: "bg-pink-500", name: "TikTok" },
                    { color: "bg-yellow-500", name: "Games" },
                    { color: "bg-purple-500", name: "Gallery" },
                  ].map((app, i) => (
                    <motion.div
                      key={app.name}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={`w-10 h-10 ${app.color} rounded-xl shadow-md`} />
                      <span className="text-[8px] text-gray-400">{app.name}</span>
                    </motion.div>
                  ))}
                </div>
                {/* Signal wave overlay */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent pointer-events-none"
                />
                <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> MIRRORING
                </div>
              </motion.div>
            )}

            {/* Camera */}
            {activeFeature === "camera" && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: showContent ? 1 : 0.3, scale: showContent ? 1 : 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')] bg-cover bg-center"
              >
                <div className="absolute top-2 left-2 flex gap-2">
                  <div className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                  </div>
                  <div className="bg-black/50 backdrop-blur text-white text-[8px] font-bold px-2 py-0.5 rounded">
                    Front Camera
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mic */}
            {activeFeature === "mic" && (
              <motion.div
                key="mic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded flex items-center gap-1 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" /> REC
                </div>
                {/* Audio waveform */}
                <div className="flex gap-1 items-center justify-center h-16 w-3/4">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${Math.random() * 30 + 10}%`, `${Math.random() * 80 + 20}%`, `${Math.random() * 30 + 10}%`] }}
                      transition={{ repeat: Infinity, duration: Math.random() * 0.4 + 0.3 }}
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"
                    />
                  ))}
                </div>
                <p className="text-blue-300 mt-4 font-medium text-xs">Listening to environment...</p>
              </motion.div>
            )}

            {/* Location */}
            {activeFeature === "location" && (
              <motion.div
                key="location"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full animate-ping absolute" />
                  <div className="w-10 h-10 bg-emerald-500/30 rounded-full animate-pulse absolute" />
                  <MapPin className="w-8 h-8 text-emerald-500 relative z-10 drop-shadow-lg" />
                </div>
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-4 left-3 right-3 bg-white/90 backdrop-blur p-2.5 rounded-xl shadow-lg"
                >
                  <p className="text-[10px] font-bold text-gray-900">গ্রামের বাড়ি, সিলেট</p>
                  <p className="text-[8px] text-gray-500">Safe Zone • ±15m accuracy</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 inset-x-0 h-[50px] bg-white border-t border-gray-100 flex justify-around items-center px-2 z-30">
          {[
            { id: "screen-view", icon: <Smartphone className="w-4 h-4" />, label: "Screen" },
            { id: "camera", icon: <Camera className="w-4 h-4" />, label: "Camera" },
            { id: "mic", icon: <Mic className="w-4 h-4" />, label: "Mic" },
            { id: "location", icon: <MapPin className="w-4 h-4" />, label: "Location" },
          ].map((item) => (
            <button
              key={item.id}
              data-guide-id={`landing-${item.id === "screen-view" ? "screen-view" : item.id}`}
              onClick={() => onFeatureClick?.(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                activeFeature === item.id ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {item.icon}
              <span className="text-[7px] font-bold">{item.label}</span>
              {activeFeature === item.id && (
                <motion.div
                  layoutId="phone-nav-indicator"
                  className="w-4 h-0.5 bg-emerald-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
