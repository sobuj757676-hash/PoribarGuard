"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Check } from "lucide-react";

const COUNTRIES = [
    { value: "UAE", label: "🇦🇪 United Arab Emirates" },
    { value: "KSA", label: "🇸🇦 Saudi Arabia" },
    { value: "UK", label: "🇬🇧 United Kingdom" },
    { value: "USA", label: "🇺🇸 United States" },
    { value: "Malaysia", label: "🇲🇾 Malaysia" },
    { value: "Singapore", label: "🇸🇬 Singapore" },
    { value: "Qatar", label: "🇶🇦 Qatar" },
    { value: "Kuwait", label: "🇰🇼 Kuwait" },
    { value: "Oman", label: "🇴🇲 Oman" },
    { value: "Bahrain", label: "🇧🇭 Bahrain" },
    { value: "Italy", label: "🇮🇹 Italy" },
    { value: "Bangladesh", label: "🇧🇩 Bangladesh" },
    { value: "Other", label: "🌍 Other" },
];

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        country: "",
        city: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const passwordStrength = (() => {
        const p = form.password;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 6) s++;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return Math.min(s, 4);
    })();

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-emerald-400", "bg-emerald-500"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            // Register
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Registration failed");
                setLoading(false);
                return;
            }

            // Auto sign-in after registration
            const result = await signIn("credentials", {
                email: form.email.trim().toLowerCase(),
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                // Account created but sign-in failed — redirect to login
                router.push("/login");
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <div className="bg-emerald-600 p-2 rounded-xl group-hover:bg-emerald-500 transition-colors">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight">
                        PoribarGuard <span className="text-emerald-500">BD</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Start Free 7-Day Trial</h1>
                        <p className="text-gray-400 mt-1 text-sm">
                            No credit card required • Protect your family today
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={update("name")}
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="Abdul Karim"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address *</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={update("email")}
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={update("password")}
                                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all pr-12"
                                    placeholder="Min 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Strength indicator */}
                            {form.password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 flex gap-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColor[passwordStrength] : "bg-gray-700"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400">{strengthLabel[passwordStrength]}</span>
                                </div>
                            )}
                        </div>

                        {/* Phone (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Phone <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={update("phone")}
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="+971 50 XXX XXXX"
                            />
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Country <span className="text-gray-500">(optional)</span>
                            </label>
                            <select
                                value={form.country}
                                onChange={update("country")}
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
                            >
                                <option value="">Select your country</option>
                                {COUNTRIES.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                City <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={update("city")}
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="Dubai, Riyadh, London..."
                            />
                        </div>

                        {/* Benefits */}
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                            {[
                                "7-day free trial, no credit card",
                                "Real-time location tracking",
                                "App blocking & screen time control",
                                "SOS alerts & geofencing",
                            ].map((text) => (
                                <div key={text} className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    {text}
                                </div>
                            ))}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Free Account"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    By creating an account you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}
