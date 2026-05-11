"use client";

import { Howl, Howler } from "howler";

/**
 * VoiceEngine — Singleton audio manager for the guided onboarding.
 * Handles playing pre-recorded Bengali voice-overs for each step,
 * muting/ducking background audio, and graceful fallbacks.
 */

class VoiceEngineManager {
  constructor() {
    this.currentSound = null;
    this.isMuted = false;
    this.audioCache = {};
    
    // Check if we're in the browser
    this.isBrowser = typeof window !== "undefined";
  }

  /**
   * Preload audio files for smooth playback
   */
  preload(stepIds) {
    if (!this.isBrowser) return;
    
    stepIds.forEach((id) => {
      if (!this.audioCache[id]) {
        this.audioCache[id] = new Howl({
          src: [`/audio/guide-${id}.mp3`],
          preload: true,
          // If the file is missing, it will gracefully fail to play later
        });
      }
    });
  }

  /**
   * Play voice-over for a specific step
   * @param {string} stepId - The ID of the step (e.g., 'screen-view')
   */
  play(stepId) {
    if (!this.isBrowser || this.isMuted) return;

    // Stop any currently playing audio
    this.stop();

    // Ducking: If there was background app audio, we would lower it here
    // Howler.volume(0.2); // Lower global volume
    
    let sound = this.audioCache[stepId];
    
    if (!sound) {
      sound = new Howl({
        src: [`/audio/guide-${stepId}.mp3`],
        onloaderror: () => {
          console.warn(`[VoiceEngine] Audio file for step '${stepId}' not found at /audio/guide-${stepId}.mp3`);
        },
        onplayerror: () => {
          console.warn(`[VoiceEngine] Failed to play audio for step '${stepId}'`);
        }
      });
      this.audioCache[stepId] = sound;
    }

    this.currentSound = sound;
    sound.play();
  }

  /**
   * Stop the currently playing voice-over
   */
  stop() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound = null;
    }
    // Restore ducked volume
    // Howler.volume(1.0);
  }

  /**
   * Toggle global mute for the voice engine
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }
}

export const VoiceEngine = new VoiceEngineManager();
