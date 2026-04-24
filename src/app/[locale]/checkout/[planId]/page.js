"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Shield, ArrowLeft, CheckCircle, CreditCard, Building2, PhoneCall, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ManualPaymentForm from '@/components/dashboard/ManualPaymentForm';
import { useManualPaymentStatus } from '@/hooks/useApi';
import Link from 'next/link';

export default function CheckoutPage({ params }) {
    const { planId } = params; // Extract directly since it's a client component, although Next.js 15 says it's a promise, we can unwrap with React.use() if necessary, but typical client side it works directly or through unwrapping. Let's use React.use(params) to be safe for Next.js 15.
    const resolvedParams = React.use(params);
    const resolvedPlanId = resolvedParams.planId;

    const router = useRouter();
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/login');
        },
    });

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Method, 2: Pay/Verify
    const [methodType, setMethodType] = useState(null); // 'online' | 'manual'
    const [isProcessing, setIsProcessing] = useState(false);

    const { pendingPayment, mutate: mutateManualPayment } = useManualPaymentStatus();

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch('/api/subscriptions/packages');
                if (res.ok) {
                    const pkgs = await res.json();
                    const selected = pkgs.find(p => p.id === resolvedPlanId);
                    if (selected) {
                        setPlan(selected);
                    } else {
                        toast.error("Plan not found");
                        router.push('/en/dashboard');
                    }
                }
            } catch (err) {
                toast.error("Error loading plan details");
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [resolvedPlanId, router]);

    const handleCheckout = async (gateway) => {
        setIsProcessing(true);
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
            }
        } catch (e) {
            toast.error('Network error during checkout');
            setIsProcessing(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!plan) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => router.push('/en/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-black text-lg tracking-tight">PG Checkout</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">

                {/* Stepper */}
                <div className="mb-8 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0"></div>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500`} style={{ width: step === 1 ? '50%' : '100%' }}></div>

                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>1</div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Select Plan</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>2</div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Payment</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 && pendingPayment ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>3</div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Verify</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left/Top: Order Summary */}
                    <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">Order Summary</h2>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mb-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase">{plan.name}</h3>
                                    <p className="text-xs text-slate-500">Subscription Plan</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                                <span className="text-sm font-medium text-slate-500">Total Price</span>
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">৳{plan.priceMonthly}</span>
                            </div>
                        </div>

                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-3 mb-6">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Billed Monthly</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Instant Activation (Online)</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Cancel anytime</li>
                        </ul>

                        <a href="https://wa.me/1234567890?text=Hello%20PoribarGuard%20Support,%20I%20need%20help%20with%20my%20payment%20checkout." target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <PhoneCall className="w-4 h-4" /> Need Help?
                        </a>
                    </div>

                    {/* Right/Bottom: Payment Flow */}
                    <div className="w-full lg:w-2/3">
                        {pendingPayment ? (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-8 text-center shadow-sm">
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-black text-amber-900 dark:text-amber-300 mb-2">Verification Pending</h2>
                                <p className="text-amber-700 dark:text-amber-500 max-w-md mx-auto">
                                    Your manual payment of ৳{pendingPayment.amount} via {pendingPayment.method} is being verified by our team. You will be notified once activated.
                                </p>
                                <button onClick={() => router.push('/en/dashboard')} className="mt-6 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                                    Return to Dashboard
                                </button>
                            </div>
                        ) : step === 1 ? (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Select Payment Method</h2>
                                <p className="text-slate-500 mb-6">Choose how you&apos;d like to pay for your subscription.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Online Payment Tile */}
                                    <button
                                        onClick={() => setMethodType('online')}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${methodType === 'online' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                                    >
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <CreditCard className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Online Payment</h3>
                                        <p className="text-sm text-slate-500">Pay instantly via cards or mobile banking (bKash/Nagad via gateway).</p>
                                    </button>

                                    {/* Manual Payment Tile */}
                                    <button
                                        onClick={() => setMethodType('manual')}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${methodType === 'manual' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                                    >
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <Building2 className="w-6 h-6 text-pink-500" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Manual Payment (Agent)</h3>
                                        <p className="text-sm text-slate-500">Send money directly to our agent number and submit proof.</p>
                                    </button>
                                </div>

                                {methodType && (
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold px-8 py-3 rounded-xl shadow-lg transition-colors"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Complete Payment</h2>

                                {methodType === 'online' && (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                        <p className="text-slate-500 mb-6">You will be redirected to our secure payment gateway.</p>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={() => handleCheckout('bkash')}
                                                disabled={isProcessing}
                                                className="bg-[#E2136E] hover:bg-[#d10f63] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-[#E2136E]/20 transition flex-1 flex justify-center items-center disabled:opacity-50"
                                            >
                                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with bKash'}
                                            </button>
                                            <button
                                                onClick={() => handleCheckout('amarpay')}
                                                disabled={isProcessing}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition flex-1 flex justify-center items-center disabled:opacity-50"
                                            >
                                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with AmarPay'}
                                            </button>
                                        </div>
                                        <button onClick={() => setStep(1)} className="mt-6 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium">
                                            &larr; Change Payment Method
                                        </button>
                                    </div>
                                )}

                                {methodType === 'manual' && (
                                    <div className="-mt-6">
                                        <button onClick={() => setStep(1)} className="mb-4 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium inline-block">
                                            &larr; Change Payment Method
                                        </button>
                                        <ManualPaymentForm
                                            packageId={plan.id}
                                            amount={plan.priceMonthly}
                                            packageName={plan.name}
                                            onCancel={() => setStep(1)}
                                            onSuccess={() => mutateManualPayment()}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
