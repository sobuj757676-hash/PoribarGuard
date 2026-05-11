# PoribarGuard Interactive Guided Onboarding (IGO) Audio Files

This directory contains the pre-recorded Bengali voice-overs for the Interactive Guided Onboarding tours (Dashboard and Landing Page).

## File Naming Convention

The `VoiceEngine.js` automatically looks for `.mp3` files in this directory matching the `id` of the onboarding steps defined in `src/data/onboarding-steps.js`.

Files must be named exactly as `guide-{stepId}.mp3`.

### Required Files:

**Dashboard Post-Login Ghost Guide:**
- `guide-screen-view.mp3`
- `guide-camera.mp3`
- `guide-ambient-mic.mp3`
- `guide-send-alarm.mp3`
- `guide-live-location.mp3`

**Landing Page Interactive Demo:**
- `guide-landing-screen.mp3`
- `guide-landing-mic.mp3`
- `guide-landing-location.mp3`
- `guide-landing-camera.mp3`

## Fallback Behavior

If an audio file is missing (e.g., during development), the `VoiceEngine` will gracefully fail and log a warning to the browser console. The visual guide (spotlight, subtitles) will continue to work normally.
