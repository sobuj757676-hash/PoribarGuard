import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import PainPromise from '@/components/landing/PainPromise';
import WhatsAppExplainer from '@/components/landing/WhatsAppExplainer';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import StickyMobileCTA from '@/components/landing/StickyMobileCTA';
import Link from 'next/link';
import prisma from '@/lib/prisma';

// Helper to safely parse JSON from SystemConfig
function parseConfig(configs, key) {
  const entry = configs.find(c => c.key === key);
  if (!entry) return null;
  try { return JSON.parse(entry.value); } catch { return null; }
}

export default async function Home() {
  // Fetch all landing configs server-side (great for SEO)
  let configs = [];
  let subscriptionPackages = [];
  try {
    const [fetchedConfigs, fetchedPackages] = await Promise.all([
      prisma.systemConfig.findMany({
        where: {
          key: {
            in: [
              'landing_hero', 'landing_features', 'landing_pricing',
              'landing_faq', 'landing_testimonials', 'landing_howitworks',
              'landing_cta', 'landing_footer'
            ]
          }
        }
      }),
      prisma.subscriptionPackage.findMany({
        where: { isActive: true },
        orderBy: { priceMonthly: 'asc' }
      })
    ]);
    configs = fetchedConfigs;
    subscriptionPackages = fetchedPackages;
  } catch (err) {
    console.warn("Could not fetch system configs or packages, using default landing config fallback", err.message);
  }

  const heroConfig = parseConfig(configs, 'landing_hero') || {};
  const featuresConfig = parseConfig(configs, 'landing_features') || {};
  let pricingConfig = parseConfig(configs, 'landing_pricing') || {};

  // Transform dynamic packages for pricing config
  if (subscriptionPackages.length > 0) {
    pricingConfig.tiers = subscriptionPackages.map(pkg => {
      let parsedFeatures = [];
      try {
        parsedFeatures = JSON.parse(pkg.displayFeatures || '[]');
        if (!parsedFeatures || parsedFeatures.length === 0) {
          parsedFeatures = JSON.parse(pkg.features).map(f => f.replace('_', ' '));
        }
      } catch(e) { }
      return {
        id: pkg.id,
        name: pkg.name,
        price: `৳${pkg.priceMonthly}`,
        desc: pkg.description || '',
        features: parsedFeatures,
        isPopular: pkg.isPopular,
        btnText: pkg.btnText || 'Start Free Trial'
      };
    });
  }

  const faqConfig = parseConfig(configs, 'landing_faq') || {};
  const testimonialsConfig = parseConfig(configs, 'landing_testimonials') || {};
  const howItWorksConfig = parseConfig(configs, 'landing_howitworks') || {};
  const ctaConfig = parseConfig(configs, 'landing_cta') || {};
  const footerConfig = parseConfig(configs, 'landing_footer') || {};

  // CTA defaults
  const cta = ctaConfig || {};
  const ctaHeading = cta.heading || 'আজই শুরু করুন —';
  const ctaSubheading = cta.subheading || 'আপনার সন্তানের নিরাপত্তা আপনার হাতে';
  const ctaBtnText = cta.btnText || 'Get Started Free';
  const ctaBtnLink = cta.btnLink || '/register';
  const ctaFooterNote = cta.footerNote || 'No credit card required for 7-day trial.';

  return (
    <main className="min-h-screen font-sans bg-white selection:bg-emerald-200 selection:text-emerald-900">

      <Navbar />
      <Hero config={heroConfig} />

      {/* Floating Social Proof Badge (above the fold on mobile) */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex -space-x-2">
            {['bg-emerald-500','bg-teal-500','bg-cyan-500','bg-emerald-600','bg-teal-600'].map((bg, i) => (
              <div key={i} className={`w-8 h-8 ${bg} rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}>{['A','R','K','S','M'][i]}</div>
            ))}
          </div>
          <div className="text-sm">
            <span className="font-bold text-gray-900">15,000+</span>
            <span className="text-gray-500 ml-1">parents protecting their family</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-sm">★</span>)}
            <span className="text-xs text-gray-500 ml-1 font-medium">4.9/5</span>
          </div>
        </div>
      </div>

      <PainPromise />
      <div id="live-demo"><WhatsAppExplainer /></div>
      <div id="features"><Features config={featuresConfig} /></div>
      <div id="how-it-works"><HowItWorks config={howItWorksConfig} /></div>
      <div id="testimonials"><SocialProof config={testimonialsConfig} /></div>
      <div id="pricing"><Pricing config={pricingConfig} /></div>

      {/* Final CTA Banner */}
      <section className="bg-emerald-600 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 shadow-sm" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
            {ctaHeading} <br className="md:hidden" />
            <span className="text-emerald-200">{ctaSubheading}</span>
          </h2>
          <Link href={ctaBtnLink} className="inline-block px-10 py-5 bg-white text-emerald-700 font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            {ctaBtnText}
          </Link>
          <p className="mt-4 text-emerald-100 font-medium text-sm">{ctaFooterNote}</p>
        </div>
      </section>

      <FAQ config={faqConfig} />
      <Footer config={footerConfig} />

      {/* Floating Support Widget Mock */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100]">
        <a href="https://wa.me/1234567890?text=Hello%20PoribarGuard%20Support,%20I%20need%20help." target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-emerald-600 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-emerald-500 transition-all" aria-label="Contact Support on WhatsApp">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </a>
      </div>

      <StickyMobileCTA />

    </main>
  );
}
