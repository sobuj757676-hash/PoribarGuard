/**
 * Onboarding Guide Step Definitions
 * 
 * Each step defines a target element (via data-guide-id attribute),
 * display text in English & Bengali, and positioning hints.
 */

export const DASHBOARD_GUIDE_STEPS = [
  {
    id: 'screen-view',
    targetSelector: '[data-guide-id="action-screen"]',
    title: 'Screen View',
    titleBn: 'স্ক্রিন ভিউ',
    description: 'See what your child is doing on their phone screen in real-time.',
    descriptionBn: 'আপনার সন্তান ফোনে কী করছে তা সরাসরি আপনার ফোনে দেখুন।',
    icon: '📱',
    tooltipPosition: 'bottom',
  },
  {
    id: 'camera',
    targetSelector: '[data-guide-id="action-camera"]',
    title: 'Live Camera',
    titleBn: 'লাইভ ক্যামেরা',
    description: 'Activate the front or back camera to see your child\'s surroundings.',
    descriptionBn: 'আপনার সন্তানের আশেপাশের পরিবেশ সামনের বা পেছনের ক্যামেরা দিয়ে দেখুন।',
    icon: '📷',
    tooltipPosition: 'bottom',
  },
  {
    id: 'ambient-mic',
    targetSelector: '[data-guide-id="action-mic"]',
    title: 'Ambient Microphone',
    titleBn: 'অ্যাম্বিয়েন্ট মাইক্রোফোন',
    description: 'Listen to the surrounding environment of your child\'s phone.',
    descriptionBn: 'ফোনের আশেপাশের শব্দ শুনুন — কার সাথে কথা বলছে বা বাড়ির পরিবেশ কেমন।',
    icon: '🎙️',
    tooltipPosition: 'bottom',
  },
  {
    id: 'send-alarm',
    targetSelector: '[data-guide-id="action-alarm"]',
    title: 'Emergency Alarm',
    titleBn: 'জরুরি অ্যালার্ম',
    description: 'Send an emergency SOS alarm to your child\'s device instantly.',
    descriptionBn: 'এক ট্যাপে আপনার সন্তানের ফোনে জরুরি অ্যালার্ম পাঠান।',
    icon: '🚨',
    tooltipPosition: 'bottom',
  },
  {
    id: 'live-location',
    targetSelector: '[data-guide-id="live-location"]',
    title: 'Live Location',
    titleBn: 'লাইভ লোকেশন',
    description: 'Track your child\'s real-time location on a map, 24/7.',
    descriptionBn: 'আপনার সন্তান এখন কোথায় আছে তা ম্যাপে সরাসরি দেখুন — ২৪ ঘণ্টা।',
    icon: '📍',
    tooltipPosition: 'top',
  },
];

export const LANDING_GUIDE_STEPS = [
  {
    id: 'landing-screen',
    targetSelector: '[data-guide-id="landing-screen-view"]',
    title: 'Screen View',
    titleBn: 'স্ক্রিন ভিউ',
    description: 'See what your child is browsing — right from your phone.',
    descriptionBn: 'আপনার অনুপস্থিতিতে আপনার সন্তান মোবাইলে খারাপ কিছু দেখছে কি না, তা এখন আপনি সরাসরি নিজের ফোনে দেখতে পাবেন।',
    icon: '📱',
    tooltipPosition: 'bottom',
  },
  {
    id: 'landing-mic',
    targetSelector: '[data-guide-id="landing-ambient-mic"]',
    title: 'Ambient Mic',
    titleBn: 'অ্যাম্বিয়েন্ট মাইক',
    description: 'Listen to the environment around your child\'s phone.',
    descriptionBn: 'বাড়ির পরিবেশ কেমন, বা সে কার সাথে কথা বলছে — তা শুনতে পাবেন এক ক্লিকেই।',
    icon: '🎙️',
    tooltipPosition: 'bottom',
  },
  {
    id: 'landing-location',
    targetSelector: '[data-guide-id="landing-location"]',
    title: 'Live Location',
    titleBn: 'লাইভ লোকেশন',
    description: 'Know exactly where your child is, anytime.',
    descriptionBn: 'রাত হয়ে গেলেও সন্তান ঘরে ফিরলো কি না, তা নিয়ে আর দুশ্চিন্তা করতে হবে না।',
    icon: '📍',
    tooltipPosition: 'bottom',
  },
  {
    id: 'landing-camera',
    targetSelector: '[data-guide-id="landing-camera"]',
    title: 'Live Camera',
    titleBn: 'লাইভ ক্যামেরা',
    description: 'See your child\'s surroundings through their phone camera.',
    descriptionBn: 'আপনার সন্তান এখন কী করছে — ক্যামেরা দিয়ে সরাসরি দেখুন।',
    icon: '📷',
    tooltipPosition: 'bottom',
  },
];
