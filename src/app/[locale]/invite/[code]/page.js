import Link from 'next/link';
import { Download, ShieldAlert, CheckCircle, ChevronRight } from 'lucide-react';

export default async function InvitePage({ params }) {
    const { code } = await params;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-500 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                    <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <img src="/logo.png" alt="PoribarGuard Logo" className="w-14 h-14 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="text-emerald-600 font-bold text-xl">PG</span>'; }} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">PoribarGuard BD</h1>
                    <p className="text-emerald-50 text-sm font-medium">নিরাপদ পরিবার, নিশ্চিন্ত প্রবাস</p>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-8">
                    {/* Welcome Text in Bangla */}
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">স্বাগতম! (Welcome)</h2>
                        <p className="text-gray-600 text-sm">অ্যাপটি চালু করতে নিচের ধাপগুলো অনুসরণ করুন।</p>
                    </div>

                    {/* Step 1: Download */}
                    <div className="relative">
                        <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                        <div className="relative pl-6 pb-6">
                            <div className="absolute left-[-15px] top-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white text-xs font-bold">1</div>
                            <h3 className="font-bold text-gray-800 mb-1">ইন্সটলার ডাউনলোড করুন</h3>
                            <p className="text-xs text-gray-500 mb-3">Download the secure installer app first.</p>

                            <a href="/api/wizard-apk/download" download className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30">
                                <Download className="w-5 h-5" />
                                Download Installer (3 MB)
                            </a>

                            {/* Secure Installer Notice */}
                            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-3 items-start">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-800 mb-1">100% Safe & Easy Install</p>
                                    <p className="text-[11px] text-emerald-700">এই ইন্সটলার অ্যাপটি কোনো ওয়ার্নিং ছাড়াই নিরাপদে মূল অ্যাপটি আপনার ফোনে সেটআপ করে দেবে।</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Code */}
                        <div className="relative pl-6">
                            <div className="absolute left-[-15px] top-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white text-xs font-bold">2</div>
                            <h3 className="font-bold text-gray-800 mb-1">এই কোডটি বসান</h3>
                            <p className="text-xs text-gray-500 mb-4">অ্যাপ খোলার পর নিচের ৬-সংখ্যার কোডটি দিন।</p>

                            <div className="bg-gray-100 border border-gray-200 rounded-2xl py-5 text-center shadow-inner">
                                <span className="text-4xl font-black text-gray-800 tracking-[0.25em] ml-2">{code}</span>
                            </div>
                            <p className="text-center text-xs text-emerald-600 font-bold mt-3 flex items-center justify-center gap-1">
                                <CheckCircle className="w-4 h-4" /> সবকিছু প্রস্তুত! (All Set!)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400">© 2026 PoribarGuard BD. Secure & Private.</p>
                </div>
            </div>
        </div>
    );
}
