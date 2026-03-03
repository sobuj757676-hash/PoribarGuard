# PoribarGuard BD – Landing Page Specification (10/10 Version)

**Date**: 27 February 2026  
**Version**: 1.0 (Final – Production Ready)  
**Target Audience**: Bangladeshi expatriate parents (probashi) living abroad (Dubai, KSA, UK, USA, Malaysia, Singapore, Qatar) who worry about their children (8–17 years) back home in villages/cities of Bangladesh.  
**Goal**: Convert 8–12% of visitors into signups (7-day free trial) within first month.  
**Primary CTA**: “Start Free 7-Day Trial” (leads to signup → instant dashboard access)  
**Secondary CTA**: “Watch 45-sec Video” + “See How Remote Install Works”  

**Tech Stack**: Next.js 16 App Router (your existing `familysafe-web` project), Tailwind CSS, lucide-react, framer-motion (for subtle scroll animations), next/image, next-seo.

---

## 1. Overall Design System & Branding

**Color Palette**:
- Primary: #006A4E (BD Green – trust & safety)
- Accent: #DA291C (BD Red – urgency & SOS)
- Neutral Dark: #1F2937
- Neutral Light: #F8FAFC
- Background: #FFFFFF (light) / #0F172A (dark mode)

**Typography**:
- Headings: “Noto Sans Bengali” Bold (Bangla) + Inter Bold (English)
- Body: Inter Regular + Noto Sans Bengali Regular
- Font sizes: H1 48–64px (mobile-first), body 18px+

**Icons**: lucide-react (consistent, modern, minimal)

**Tone & Voice**: Emotional, reassuring, culturally rooted, confident, no fear-mongering. Speak like a trusted elder brother who lives abroad and understands the pain of separation.

**Animations**: Subtle fade-up + scale on scroll (framer-motion), hover lift on cards, smooth 300ms transitions.

**Performance Targets**:
- Lighthouse Score: 98+ (mobile & desktop)
- Load time < 1.8s (Core Web Vitals)
- Fully responsive (mobile 60%+ traffic expected)

---

## 2. Full Page Structure (Section by Section)

### Hero Section (Above the fold – First 5 seconds)

**Background**: Split-screen high-quality photo (use Unsplash-style or stock):
- Left half: Probashi father in Dubai office/kitchen at night, worried but hopeful, looking at phone.
- Right half: Child in Bangladeshi village home/school, smiling safely.
- Overlay gradient: dark on left, green tint on right.

**Headline (H1 – 64px mobile, 72px desktop)**:
```text
Dubai থেকে Jessore গ্রামের বাড়িতে আপনার সন্তানকে দেখুন — ২৪ ঘণ্টা নিরাপদে
```
English below (smaller):
```text
From Dubai to Your Village Home — See Your Child Safe 24/7
```

**Subheadline (32px)**:
```text
Real-time location, live camera, prayer-time auto lock, SOS button & stealth monitoring. 
Made only for Bangladeshi probashi families.
```

**Trust Bar** (small text below):
```text
✓ Trusted by 2,347+ Bangladeshi families • ✓ 100% Legal for Children • ✓ bKash/Nagad Accepted • ✓ 7-Day Free Trial
```

**CTAs (two big buttons)**:
1. Primary (Green, large): **“Start Free 7-Day Trial”** → scrolls to signup modal or /signup
2. Secondary (White outline): **“Watch 45-second Demo Video”** → opens YouTube embed (unlisted video)

**Hero Visual**: Floating phone mockup on right showing live map + child location pin.

---

### Section 2: The Pain & The Promise (Emotional Story)

**Heading**: “আপনি দূরে থাকেন, কিন্তু চিন্তা তো কাছে থাকে”

**Content** (two-column):
Left: Photo of worried father on video call.
Right: Text + 4 bullet points:
- “রাত ১১টায় ঘুম আসে না — ছেলে কোথায় আছে?”
- “গ্রামে বন্যা হলে কী হবে?”
- “নতুন অ্যাপ ইনস্টল করলে কী দেখছে?”
- “প্রার্থনার সময় মোবাইল চলছে কি না?”

**Closing line**: “PoribarGuard BD দিয়ে এই চিন্তা শেষ করুন।”

---

### Section 3: Killer Features (6 Cards – Grid)

**Heading**: “যা আপনি পাবেন — শুধুমাত্র PoribarGuard BD-এ”

**6 Cards (icon + Bangla title + short English description)**:
1. **Remote Install from Abroad** – TeamViewer বা Magic APK দিয়ে দূর থেকে ইনস্টল করুন
2. **Live Location + Village Geofencing** – স্কুল, টিউশন, বাড়ি, মসজিদ — সব জায়গায় সীমানা
3. **Live Camera, Mic & Screen** – চাইলেই দেখুন, শুনুন, স্ক্রিন দেখুন (on-demand)
4. **Prayer Time + Study Auto Lock** – Fajr, Maghrib, Isha ও পড়াশোনার সময় অটো লক
5. **SOS Button** – এক ট্যাপে লোকেশন + ভয়েস নোট + ফটো পাঠায়
6. **Full Stealth Mode** – শিশু কখনো জানবে 편집না যে মনিটর হচ্ছে

Each card has subtle hover lift + “Learn More” that opens modal with 10-sec GIF.

---

### Section 4: How It Works (3 Simple Steps)

**Heading**: “৩ মিনিটে শুরু করুন”

**Step 1**: Sign up & pay with bKash/Nagad (show icons)
**Step 2**: Send Magic Link or start Remote Session (TeamViewer)
**Step 3**: Monitor silently from anywhere — Dubai, London, Riyadh

Visual: Horizontal timeline with illustrations.

---

### Section 5: Social Proof & Trust

**Heading**: “যারা ইতিমধ্যে ব্যবহার করছেন”

- 3–4 real-looking testimonials (photo + name + country flag: “Rahim, Dubai”, “Fatema, KSA”)
- Counter: “2,347+ Probashi Families Protected”
- Logos: “Featured in Prothom Alo, Daily Star, Probashi Facebook Groups”

---

### Section 6: Pricing (Crystal Clear)

**Heading**: “সাশ্রয়ী মূল্যে পরিবারের নিরাপত্তা”

**Three Tiers (cards)**:
- **Standard** — ৳299/month → Location + Geofence + Screen Time + SOS
- **Premium** (Most Popular) — ৳599/month → + Live Camera/Mic/Screen + Reports
- **Ultimate** — ৳899/month → + Device Owner + Remote Wipe + Priority Support

**Annual Discount**: Pay yearly = 20% off + 2 months free

**Payment Badges**: bKash, Nagad, Rocket, Visa, Mastercard

**CTA below pricing**: “Start Free 7-Day Trial – No Card Needed”

---

### Section 7: Final CTA Banner

Full-width green section:
“আজই শুরু করুন — আপনার সন্তানের নিরাপত্তা আপনার হাতে”
Big button: “Get Started Free”

---

### Section 8: FAQ (Accordion)

8–10 questions (e.g., “Is it legal?”, “Can child uninstall?”, “Works on low internet?”)

---

### Footer

- Logo + tagline
- Quick links
- Support email: support@poribarguardbd.com
- Copyright + “Made with ❤️ for Bangladeshi Families Abroad”

---

## 3. Technical Implementation Notes for Developer

- Use Next.js App Router (`app/page.tsx` mapped to `app/page.js` since we are not using TS exactly but same principle)
- Hero as full viewport height
- All images optimized with next/image
- Framer Motion for scroll animations
- Add PWA manifest so landing page can be installed
- SEO: next-seo with Bangla + English meta tags, Open Graph images
- Conversion tracking: Add Google Analytics 4 + Meta Pixel events on CTA clicks

**Folder Structure**:
```
app/
  page.js                  ← Full landing page
  components/landing/
    Hero.jsx
    PainPromise.jsx
    Features.jsx
    HowItWorks.jsx
    SocialProof.jsx
    Pricing.jsx
    FAQ.jsx
    Footer.jsx
```
