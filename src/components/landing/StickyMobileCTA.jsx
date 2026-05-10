"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function StickyMobileCTA() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 600);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[90] md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-4 duration-300">
            <Link href="/register" className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all">
                Start Free Trial — No Card Required
            </Link>
        </div>
    );
}
