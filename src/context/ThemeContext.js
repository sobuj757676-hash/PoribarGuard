"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "dark",
    setTheme: () => { },
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("dark");
    const [mounted, setMounted] = useState(false);

    // On mount, read from localStorage or system preference
    useEffect(() => {
        setTimeout(() => {
            const stored = localStorage.getItem("pg-theme");
            if (stored === "light" || stored === "dark") {
                setTheme(stored);
            } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                setTheme("light");
            } else {
                setTheme("dark");
            }
            setMounted(true);
        }, 0);
    }, []);

    // Apply the class to <html> whenever theme changes
    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("pg-theme", theme);
    }, [theme, mounted]);

    // Listen for system preference changes
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => {
            // Only auto-switch if the user hasn't set a preference
            if (!localStorage.getItem("pg-theme")) {
                setTheme(e.matches ? "dark" : "light");
            }
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
