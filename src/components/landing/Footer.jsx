"use client";

import { ShieldAlert } from "lucide-react";

export default function Footer({ config }) {
    const description = config?.description || 'Bringing peace of mind to Bangladeshi expatriates worldwide. Monitor, protect, and guide — from any country.';
    const supportEmail = config?.supportEmail || 'support@poribarguardbd.com';
    const productLinks = config?.productLinks || ['Features', 'Pricing', 'How it Works', 'Download Test APK'];
    const companyLinks = config?.companyLinks || ['About Us', 'Privacy Policy (for Minors)', 'Terms of Service'];

    return (
        <footer className="bg-gray-950 text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-8 h-8 text-emerald-500" />
                            <span className="text-2xl font-black text-white">PoribarGuard<span className="text-emerald-400">BD</span></span>
                        </div>
                        <p className="text-gray-400 font-medium leading-relaxed max-w-md">
                            {description}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-4">Product</h4>
                        <ul className="space-y-3">
                            {productLinks.map((link, idx) => (
                                <li key={idx}><a href="#" className="hover:text-emerald-400 transition font-medium">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-4">Company</h4>
                        <ul className="space-y-3">
                            {companyLinks.map((link, idx) => (
                                <li key={idx}><a href="#" className="hover:text-emerald-400 transition font-medium">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} PoribarGuard BD. Made with ❤️ for Probashi families.
                    </p>
                    <p className="text-sm text-gray-500">
                        <a href={`mailto:${supportEmail}`} className="hover:text-emerald-400 transition">{supportEmail}</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
