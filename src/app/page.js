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
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen font-sans bg-white selection:bg-emerald-200 selection:text-emerald-900">

      {/* 
        DEVELOPER NOTE:
        This is the new 10/10 Marketing Landing Page Spec.
        The layout uses modular components to ensure performance and clean separation of concerns.
      */}

      <Navbar />
      <Hero />
      <PainPromise />
      <div id="live-demo"><WhatsAppExplainer /></div>
      <div id="features"><Features /></div>
      <div id="how-it-works"><HowItWorks /></div>
      <div id="testimonials"><SocialProof /></div>
      <div id="pricing"><Pricing /></div>

      {/* Final CTA Banner */}
      <section className="bg-emerald-600 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 shadow-sm" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
            আজই শুরু করুন — <br className="md:hidden" />
            <span className="text-emerald-200">আপনার সন্তানের নিরাপত্তা আপনার হাতে</span>
          </h2>
          <Link href="/register" className="inline-block px-10 py-5 bg-white text-emerald-700 font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            Get Started Free
          </Link>
          <p className="mt-4 text-emerald-100 font-medium text-sm">No credit card required for 7-day trial.</p>
        </div>
      </section>

      <FAQ />
      <Footer />

      {/* Floating Support Widget Mock */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50">
        <div className="w-14 h-14 bg-emerald-600 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>

    </main>
  );
}
