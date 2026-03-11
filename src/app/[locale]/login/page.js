"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useTranslations } from "next-intl";

export default function LoginPage() {
    const router = useRouter();
    const t = useTranslations("Auth");
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: form.email.trim().toLowerCase(),
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password. Please try again.");
                setLoading(false);
                return;
            }

            const res = await fetch("/api/auth/session");
            const session = await res.json();
            const dest = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
            router.push(dest);
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Top bar */}
                <div className="flex justify-end mb-4 gap-2">
                    <ThemeToggle />
                    <LanguageSwitcher />
                </div>
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("loginTitle")}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                            {t("loginSubtitle")}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {t("emailLabel")}
                            </label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {t("passwordLabel")}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
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
                                t("loginBtn")
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {t("noAccount")}{" "}
                            <Link
                                href="/register"
                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold transition-colors"
                            >
                                {t("registerLink")}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-6">
                    Protected by PoribarGuard BD • 256-bit encryption
                </p>
            </div>
        </div>
    );
}
