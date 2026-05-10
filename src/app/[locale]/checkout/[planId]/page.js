"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Shield, ArrowLeft, CheckCircle, CreditCard, Building2, PhoneCall, Loader2, Clock, Lock, Sparkles, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import ManualPaymentForm from '@/components/dashboard/ManualPaymentForm';
import { useManualPaymentStatus } from '@/hooks/useApi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage({ params }) {
    const resolvedParams = React.use(params);
    const resolvedPlanId = resolvedParams.planId;

    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/login');
        },
    });

    // Extract locale from pathname for dynamic routing
    const locale = pathname?.split('/')[1] || 'en';

    const [plan, setPlan] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Method, 2: Pay/Verify
    const [methodType, setMethodType] = useState(null); // 'online' | 'manual'
    const [selectedManualMethodId, setSelectedManualMethodId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [redirectGateway, setRedirectGateway] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState({ onlineEnabled: true, manualEnabled: true });
    const [summaryOpen, setSummaryOpen] = useState(false);

    const canChangeMethod = paymentSettings.onlineEnabled && paymentSettings.manualEnabled;

    const { pendingPayment, mutate: mutateManualPayment } = useManualPaymentStatus();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [planRes, methodsRes] = await Promise.all([
                    fetch('/api/subscriptions/packages'),
                    fetch('/api/public/payment-methods')
                ]);

                if (methodsRes.ok) {
                    const data = await methodsRes.json();
                    const methodsList = data.methods || (Array.isArray(data) ? data : []);
                    const settingsObj = data.settings || { onlineEnabled: true, manualEnabled: true };

                    setPaymentMethods(methodsList);
                    setPaymentSettings(settingsObj);

                    if (settingsObj.onlineEnabled && !settingsObj.manualEnabled) {
                        setMethodType('online');
                        setStep(2);
                    } else if (settingsObj.manualEnabled && !settingsObj.onlineEnabled) {
                        setMethodType('manual');
                        setStep(2);
                    }
                }

                if (planRes.ok) {
                    const pkgs = await planRes.json();
                    const selected = pkgs.find(p => p.id === resolvedPlanId);
                    if (selected) {
                        setPlan(selected);
                    } else {
                        toast.error("Plan not found");
                        router.push(`/${locale}/dashboard`);
                    }
                }
            } catch (err) {
                toast.error("Error loading details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [resolvedPlanId, router, locale]);

    const handleCheckout = async (gateway) => {
        setIsProcessing(true);
        setRedirectGateway(gateway);
        try {
            const res = await fetch('/api/subscriptions/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gateway, packageId: plan.id })
            });
            const data = await res.json();
            if (res.ok && data.checkoutUrl) {
                toast.success(data.message || 'Redirecting...');
                window.location.href = data.checkoutUrl;
            } else {
                toast.error(data.error || 'Checkout failed');
                setIsProcessing(false);
                setRedirectGateway(null);
            }
        } catch (e) {
            toast.error('Network error during checkout');
            setIsProcessing(false);
            setRedirectGateway(null);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                    <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <p className="text-sm text-slate-500 font-medium">Loading checkout...</p>
            </div>
        );
    }

    if (!plan) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30">
            {/* Gateway Redirect Overlay */}
            {redirectGateway && (
                <div className="fixed inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-6 p-6">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center animate-pulse">
                        <Shield className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Securely connecting to {redirectGateway === 'bkash' ? 'bKash' : 'AmarPay'}...</h2>
                        <p className="text-slate-500 text-sm">You will be redirected in a moment. Do not close this page.</p>
                    </div>
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
            )}

            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/${locale}/dashboard`)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline text-sm">Dashboard</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-black text-base tracking-tight">Checkout</span>
                    </div>
                    {/* Trust icons inline — no scrollbar */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Lock className="w-3 h-3" />
                        <span>Secure</span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-5 md:py-10 pb-24 md:pb-10">

                {/* ========== MOBILE: Compact Order Summary Bar ========== */}
                <div className="lg:hidden mb-5">
                    <button
                        onClick={() => setSummaryOpen(!summaryOpen)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm active:scale-[0.99] transition-transform"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-left min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{plan.name}</p>
                                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">৳{plan.priceMonthly}<span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">/mo</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-400 hidden xs:inline">Details</span>
                            {summaryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                    </button>

                    {/* Expandable details */}
                    <AnimatePresence>
                        {summaryOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl px-4 pb-4 pt-2 -mt-2 shadow-sm">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Subtotal</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">৳{plan.priceMonthly}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Billing</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Monthly</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">Total</span>
                                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">৳{plan.priceMonthly}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-medium text-slate-400">
                                        <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Encrypted</span>
                                        <span className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Refund policy</span>
                                        <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Instant</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ========== DESKTOP: Sidebar Order Summary ========== */}
                    <div className="hidden lg:block w-full lg:w-[320px] flex-shrink-0 sticky top-20 z-20">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <h2 className="text-sm font-bold mb-4 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order Summary</h2>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mb-4">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase">{plan.name}</h3>
                                <p className="text-[10px] text-slate-500 mb-3">Subscription Plan</p>
                                <div className="space-y-2 text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">৳{plan.priceMonthly}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Billing</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Monthly</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total</span>
                                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">৳{plan.priceMonthly}</span>
                                    </div>
                                </div>
                            </div>
                            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Instant Activation</li>
                                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Cancel anytime</li>
                                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 24/7 Priority Support</li>
                            </ul>
                            {/* Trust strip */}
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-medium text-slate-400">
                                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit SSL</span>
                                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Refund</span>
                            </div>
                        </div>
                    </div>

                    {/* ========== Payment Flow (Full width on mobile) ========== */}
                    <div className="w-full lg:flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                        {pendingPayment || showSuccess ? (
                            <motion.div key="pending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 md:p-8 text-center shadow-sm">
                                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400 animate-pulse" />
                                </div>
                                <h2 className="text-xl font-black text-amber-900 dark:text-amber-300 mb-2">Request Received</h2>
                                <p className="text-sm text-amber-700 dark:text-amber-500 max-w-md mx-auto">
                                    Your manual payment of ৳{pendingPayment?.amount || plan.priceMonthly} via {pendingPayment?.method || "Manual"} is being verified. You&apos;ll be notified once activated.
                                </p>
                                <button onClick={() => router.push(`/${locale}/dashboard`)} className="mt-6 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors min-h-[44px] text-sm">
                                    Return to Dashboard
                                </button>
                            </motion.div>
                        ) : step === 1 ? (
                            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1">How would you like to pay?</h2>
                                <p className="text-sm text-slate-500 mb-5">Choose your preferred payment method.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {paymentSettings.onlineEnabled && (
                                        <button
                                            onClick={() => { setMethodType('online'); setStep(2); }}
                                            className={`group relative p-5 rounded-2xl border-2 text-left transition-all min-h-[44px] ${methodType === 'online' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-11 h-11 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white mb-0.5">Online Payment</h3>
                                                    <p className="text-xs text-slate-500">bKash, Nagad, or card — instant activation</p>
                                                </div>
                                            </div>
                                            <div className="absolute top-3 right-3 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                                Recommended
                                            </div>
                                        </button>
                                    )}

                                    {paymentSettings.manualEnabled && (
                                        <button
                                            onClick={() => { setMethodType('manual'); setStep(2); }}
                                            className={`group p-5 rounded-2xl border-2 text-left transition-all min-h-[44px] ${methodType === 'manual' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-11 h-11 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white mb-0.5">Manual Payment</h3>
                                                    <p className="text-xs text-slate-500">Send money directly &amp; submit proof</p>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {!paymentSettings.onlineEnabled && !paymentSettings.manualEnabled && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center text-sm font-bold border border-red-200 dark:border-red-800 mt-4">
                                        No payment methods are currently available. Please contact support.
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                                {/* Back link */}
                                {canChangeMethod && (
                                    <button onClick={() => { setStep(1); setMethodType(null); }} className="mb-4 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium inline-flex items-center gap-1.5 min-h-[44px] px-1 rounded-lg transition-colors">
                                        <ArrowLeft className="w-3.5 h-3.5" /> Change method
                                    </button>
                                )}

                                {methodType === 'online' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Pay Online</h2>
                                            <p className="text-sm text-slate-500">Choose a gateway below. You&apos;ll be redirected securely.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleCheckout('bkash')}
                                                disabled={isProcessing}
                                                className="bg-[#E2136E] hover:bg-[#c8105e] text-white font-bold px-5 py-4 rounded-xl shadow-lg shadow-[#E2136E]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 min-h-[56px] active:scale-[0.98]"
                                            >
                                                {isProcessing && redirectGateway === 'bkash' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <>
                                                        <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#E2136E] font-black text-xs flex-shrink-0">bK</span>
                                                        Pay with bKash
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleCheckout('amarpay')}
                                                disabled={isProcessing}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 min-h-[56px] active:scale-[0.98]"
                                            >
                                                {isProcessing && redirectGateway === 'amarpay' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <>
                                                        <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs flex-shrink-0">AP</span>
                                                        Pay with AmarPay
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Inline trust on mobile */}
                                        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-2 lg:hidden">
                                            <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> SSL Encrypted</span>
                                            <span className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Money-back</span>
                                        </div>
                                    </div>
                                )}

                                {methodType === 'manual' && (
                                    <div>
                                        <ManualPaymentForm
                                            packageId={plan.id}
                                            amount={plan.priceMonthly}
                                            packageName={plan.name}
                                            onCancel={() => { if (canChangeMethod) { setStep(1); setMethodType(null); } else { router.push(`/${locale}/dashboard`); } }}
                                            onSuccess={() => {
                                                mutateManualPayment();
                                                setShowSuccess(true);
                                            }}
                                            paymentMethods={paymentMethods.filter(m => m.type === 'Manual')}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Floating Support Button */}
                <a
                    href="https://wa.me/1234567890?text=Hello%20PoribarGuard%20Support,%20I%20need%20help%20with%20my%20payment%20checkout."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:bg-[#1EBE5A] hover:scale-105 transition-all flex items-center justify-center min-h-[52px] min-w-[52px]"
                    title="Need Help?"
                    aria-label="Contact Support on WhatsApp"
                >
                    <PhoneCall className="w-5 h-5" />
                </a>

            </main>
        </div>
    );
}
