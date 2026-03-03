"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "How it Works", href: "#how-it-works" },
        { name: "Testimonials", href: "#testimonials" },
        { name: "Pricing", href: "#pricing" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                ? "bg-gray-900/95 backdrop-blur-md shadow-lg py-3 border-b border-gray-800"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-500 transition-colors">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">
                            PoribarGuard <span className="text-emerald-500">BD</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-gray-300 hover:text-emerald-400 transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        {/* Desktop Actions */}
                        <div className="flex items-center gap-4 border-l border-gray-700 pl-6">
                            <Link
                                href="/login"
                                className="text-sm font-bold text-gray-300 hover:text-white transition-colors"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)] hover:shadow-[0_0_25px_rgba(5,150,105,0.5)] transition-all transform hover:-translate-y-0.5"
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <Link
                            href="/register"
                            className="text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg"
                        >
                            Free Trial
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-300 hover:text-white p-1"
                        >
                            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "100vh" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden fixed inset-0 top-[60px] bg-gray-900 border-t border-gray-800"
                    >
                        <div className="flex flex-col p-6 space-y-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-xl font-bold text-gray-300 flex items-center justify-between border-b border-gray-800 pb-4"
                                >
                                    {link.name}
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </a>
                            ))}

                            <div className="pt-6 flex flex-col gap-4">
                                <Link
                                    href="/login"
                                    className="w-full text-center py-4 rounded-xl border border-gray-700 text-white font-bold text-lg"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="w-full text-center py-4 rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-600/20"
                                >
                                    Start Free 7-Day Trial
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
