"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SWRConfig } from "swr";
import { toast } from "sonner";

const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.info = await res.json().catch(() => ({}));
        error.status = res.status;
        throw error;
    }
    return res.json();
};

export default function Providers({ children }) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <SWRConfig
                    value={{
                        fetcher,
                        revalidateOnFocus: true,
                        revalidateOnReconnect: true,
                        dedupingInterval: 2000,
                        onError: (error, key) => {
                            if (error.status !== 403 && error.status !== 404) {
                                console.error(`SWR Error fetching ${key}:`, error);
                            }
                        }
                    }}
                >
                    <SocketProvider>
                        {children}
                    </SocketProvider>
                </SWRConfig>
            </ThemeProvider>
        </SessionProvider>
    );
}
