import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PoribarGuard BD",
  description: "Secure Admin & Parental Dashboard",
  manifest: "/manifest.json",
  themeColor: "#059669",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PoribarGuard",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // Maintenance mode check (bypassed if path is already /maintenance)
  const isMaintenancePage = typeof window !== 'undefined' ? window.location.pathname.includes('/maintenance') : false; // Naive check, better to use headers or just let the page render if the route is literally /maintenance. Wait, layout runs on server. We can check headers.
  // Actually, we can check if it's the maintenance page using the pathname from headers or just handle it directly. Let's do a simple DB check first.
  let maintenanceEnabled = false;
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: "maintenance_mode" } });
    maintenanceEnabled = config?.value === "true";
  } catch (e) {
    console.error("Layout DB check failed", e);
  }

  // If maintenance mode is ON, check if the current user is an Admin
  if (maintenanceEnabled) {
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    // If not an admin, we must show them maintenance. But we can't redirect to /maintenance inside layout if we apply this layout TO /maintenance. It causes redirect loops.
    // So instead, we render a completely different generic screen right here in the layout if they aren't admin.
    if (!isAdmin) {
      return (
        <html lang={locale} suppressHydrationWarning>
          <body className={`${inter.className} antialiased min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center`}>
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">System Maintenance</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                PoribarGuard BD is currently undergoing scheduled maintenance. We will be back online shortly.
              </p>
              <Link href="/login" className="w-full inline-block bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-6 rounded-xl transition text-sm">
                Admin Access
              </Link>
            </div>
          </body>
        </html>
      );
    }
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Script id="theme-strategy" src="/scripts/theme-init.js" strategy="beforeInteractive" />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster position="bottom-right" richColors />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}