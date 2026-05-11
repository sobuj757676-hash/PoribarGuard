# Interactive Guided Onboarding (IGO) — Implementation Plan

## Goal

Build a two-layer Interactive Guided Onboarding system for PoribarGuard:
1. **Landing Page Interactive Demo** — Voice-narrated, spotlight-based product walkthrough overlaid on the hero section (pre-signup)
2. **Post-Login Ghost Guide** — Dashboard onboarding tour with spotlight, voice, and subtitles (post-signup, first login)

## Scope & Phasing

> [!IMPORTANT]
> This is a large feature. I recommend implementing it in **3 phases** to keep things manageable and testable.

### Phase 1 — Core Onboarding Engine (This Session)
Build the shared infrastructure and the **Post-Login Ghost Guide** on the dashboard. This is simpler (dashboard elements already exist as targets) and creates reusable components.

### Phase 2 — Landing Page Interactive Demo
Integrate the same engine into the landing page hero section with the mockup phone, benefit-focused narration, and conversion card.

### Phase 3 — Audio & Voice Integration
Add Bengali voice-over audio files, Howler.js audio engine, audio ducking, and synchronized subtitles.

---

## Phase 1 — Detailed Implementation Plan

### Overview

We'll build these core components and integrate the Ghost Guide into the existing dashboard.

---

### Component: Onboarding Engine (Shared)

#### [NEW] [onboarding-steps.js](file:///c:/Users/sobuj/Desktop/fsafe.com/src/data/onboarding-steps.js)
- Define the guide steps as a configuration array
- Each step: `{ id, targetSelector, title, titleBn, description, descriptionBn, icon, position }`
- Steps for dashboard: Screen View, Camera, Ambient Mic, Send Alarm, Location, etc.
- Steps for landing page (Phase 2): Screen View benefit, Mic benefit, Location benefit, Camera benefit

#### [NEW] [SpotlightOverlay.jsx](file:///c:/Users/sobuj/Desktop/fsafe.com/src/components/onboarding/SpotlightOverlay.jsx)
- Full-screen overlay with `backdrop-filter: blur(8px)` and dark glassmorphism
- Dynamic "cut-out" spotlight that highlights a specific DOM element
- Spotlight rendered using CSS clip-path or SVG mask to create the "hole" effect
- **Luminous glow** around the spotlight target (box-shadow animation)
- **Breathing animation** on the highlighted element (scale pulse 1.0 → 1.05)
- Uses `framer-motion` for spring-physics transitions between targets
- Responsive — recalculates position on resize/scroll

#### [NEW] [GhostGuide.jsx](file:///c:/Users/sobuj/Desktop/fsafe.com/src/components/onboarding/GhostGuide.jsx)
- Main orchestrator component for the post-login guide
- Manages current step state, navigation (Next/Skip/Back)
- Story-style progress bar at top (Instagram-style segmented bar)
- Renders `SpotlightOverlay`, `HandPointer`, `SubtitleDisplay`
- Controls step transitions with spring animations
- Handles first-run check via `localStorage` flag (`poribar_guide_completed`)
- Skip button with graceful fade-out
- Completion celebration with confetti-like animation
- Resume logic (saves current step to localStorage on unmount)

#### [NEW] [HandPointer.jsx](file:///c:/Users/sobuj/Desktop/fsafe.com/src/components/onboarding/HandPointer.jsx)
- Animated hand/pointer icon using CSS animation (tap gesture)
- Positioned near the spotlight target
- Smooth, organic movement synced with spotlight transitions

#### [NEW] [SubtitleDisplay.jsx](file:///c:/Users/sobuj/Desktop/fsafe.com/src/components/onboarding/SubtitleDisplay.jsx)
- Bottom-of-screen subtitle pill with semi-transparent dark background
- Typewriter-style text animation (Bengali text appears word-by-word)
- Font: Hind Siliguri (loaded via Google Fonts or local)
- Shows the description of the current step in Bengali

#### [NEW] [StoryProgressBar.jsx](file:///c:/Users/sobuj/Desktop/fsafe.com/src/components/onboarding/StoryProgressBar.jsx)
- Instagram/Facebook Stories-style thin segmented progress bar
- Fixed at top of viewport during guide
- Segments = total steps, current segment fills with animated gradient
- Completed segments remain solid

#### [NEW] [HelpBubble.jsx](file:///c:/Users/sobuj/Desktop/fsafe.com/src/components/onboarding/HelpBubble.jsx)
- Small floating "?" icon in bottom-right corner
- Pulsing green glow animation
- Shown after guide completion
- Tapping re-triggers the Ghost Guide
- Persisted visibility via state

#### [NEW] [SuccessCelebration.jsx](file:///c:/Users/sobuj/Desktop/fsafe.com/src/components/onboarding/SuccessCelebration.jsx)
- Animated completion card with confetti effect
- Bengali congratulations message
- Auto-dismisses after 5 seconds or on tap
- Uses lightweight CSS-based confetti (no heavy library)

---

### Integration: Dashboard Page

#### [MODIFY] [page.js](file:///c:/Users/sobuj/Desktop/fsafe.com/src/app/[locale]/dashboard/page.js)
- Import `GhostGuide` and `HelpBubble` components
- Add `data-guide-id` attributes to key interactive elements (Quick Action buttons: Screen, Camera, Mic, Alarm)
- Render `<GhostGuide />` conditionally based on first-run flag
- Render `<HelpBubble />` after guide completion
- Add state management for guide visibility

---

### Styling

#### [MODIFY] [globals.css](file:///c:/Users/sobuj/Desktop/fsafe.com/src/app/[locale]/globals.css)
- Add Hind Siliguri font import from Google Fonts
- Add keyframe animations: `@keyframes breathe`, `@keyframes glow-ripple`, `@keyframes confetti-fall`
- Add spotlight overlay base styles

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Spotlight method** | SVG mask with `<rect>` cut-out | More flexible than clip-path for rounded corners and glow effects |
| **Animation library** | Framer Motion (already installed) | Spring physics built-in, consistent with existing codebase |
| **Audio library** | Deferred to Phase 3 | Focus on visual system first |
| **Confetti** | Pure CSS animation | No extra dependency, lightweight |
| **Font** | Google Fonts CDN (Hind Siliguri) | Simple, no build step needed |
| **Persistence** | localStorage | Sufficient for client-side onboarding state |
| **Step targeting** | `data-guide-id` attributes | Decoupled from CSS classes, explicit and maintainable |

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify no compilation errors
- Run `npm run dev` and visually verify in browser

### Browser Verification
1. Clear localStorage → open dashboard → Ghost Guide should auto-trigger
2. Verify spotlight highlights correct buttons in sequence
3. Verify spring transitions between steps are smooth
4. Verify Skip button fades everything out gracefully
5. Verify completion shows celebration card
6. Verify "?" help bubble appears after completion
7. Verify re-opening dashboard does NOT re-trigger guide
8. Verify tapping "?" re-triggers the guide
9. Test on mobile viewport (375px width)

---

## Open Questions

> [!IMPORTANT]
> **Audio files**: For Phase 3, do you want me to use browser-based TTS (Web Speech API with Bengali voice) as a quick solution, or do you plan to record/generate professional Bengali audio files separately?

> [!NOTE]
> **Landing page demo (Phase 2)** will reuse `SpotlightOverlay`, `SubtitleDisplay`, and `HandPointer` from Phase 1, plus add new components: `LandingDemo.jsx`, `MockupPhone.jsx`, and `ConversionCard.jsx`.
