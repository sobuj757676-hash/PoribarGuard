"use client";

import { Shield } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-emerald-600 p-2 rounded-lg inline-block">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black text-white">PoribarGuard <span className="text-emerald-500">BD</span></span>
                        </div>
                        <p className="max-w-md font-medium">
                            Bringing peace of mind to Bangladeshi expatriates worldwide. Ensure your children are safe, studying, and strictly protected while you earn abroad.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-emerald-400 transition">Features</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Pricing</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">How it Works</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Download Test APK</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-emerald-400 transition">About Us</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Privacy Policy (for Minors)</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Terms of Service</a></li>
                            <li><a href="mailto:support@poribarguardbd.com" className="hover:text-emerald-400 transition text-emerald-500 font-bold">support@poribarguardbd.com</a></li>
                        </ul>
                    </div>

                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm">© {new Date().getFullYear()} PoribarGuard BD. All rights reserved.</p>
                    <p className="text-sm text-gray-500">Made with ❤️ for Bangladeshi Families Abroad</p>
                </div>

            </div>
        </footer>
    );
}
