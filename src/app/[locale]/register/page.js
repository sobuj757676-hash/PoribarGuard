"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Check } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
    const router = useRouter();
    const t = useTranslations("Auth");
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10 mt-8">
                <div className="flex justify-end mb-4 gap-2">
                    <ThemeToggle />
                    <LanguageSwitcher />
                </div>
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <div className="bg-emerald-600 p-2 rounded-xl group-hover:bg-emerald-500 transition-colors">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        PoribarGuard <span className="text-emerald-500">BD</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 backdrop-blur-sm shadow-xl dark:shadow-2xl">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("registerTitle")}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                            {t("registerSubtitle")}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("nameLabel")} *</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={update("name")}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="Abdul Karim"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("emailLabel")} *</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={update("email")}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("passwordLabel")} *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={update("password")}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all pr-12"
                                    placeholder="Min 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{strengthLabel[passwordStrength]}</span>
                                </div>
                            )}
                        </div>

                        {/* Benefits */}
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                            {[
                                "7-day free trial, no credit card",
                                "Real-time location tracking",
                                "App blocking & screen time control",
                                "SOS alerts & geofencing",
                            ].map((text) => (
                                <div key={text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
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
                                    ...
                                </>
                            ) : (
                                t("registerBtn")
                            )}
                        </button>
                    </form>

                    <div className="mt-6 relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {t("hasAccount")}{" "}
                            <Link
                                href="/login"
                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold transition-colors"
                            >
                                {t("loginLink")}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-6">
                    By creating an account you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}
