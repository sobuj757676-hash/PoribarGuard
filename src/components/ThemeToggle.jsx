"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className={`relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group ${className}`}
        >
            {/* Sun icon — visible in dark mode */}
            <Sun
                className={`w-4 h-4 text-amber-500 transition-all duration-300 absolute inset-0 m-auto ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
                    }`}
            />
            {/* Moon icon — visible in light mode */}
            <Moon
                className={`w-4 h-4 text-indigo-500 transition-all duration-300 ${theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                    }`}
            />
        </button>
    );
}
