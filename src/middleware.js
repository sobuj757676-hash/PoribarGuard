import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from '@/lib/auth';

export default auth(async (req) => {
    // 1. Fetch Dynamic Default Locale from the Database (via an edge-safe API call)
    let defaultLocale = 'en'; // Fallback
    try {
        // Must use an absolute URL in middleware
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        const res = await fetch(`${baseUrl}/api/admin/settings`, {
            cache: 'no-store'
        });
        if (res.ok) {
            const settings = await res.json();
            if (settings && settings.default_locale) {
                defaultLocale = settings.default_locale;
            }
        }
    } catch (e) {
        console.error("[Middleware] Failed to fetch default_locale:", e.message);
    }

    // 2. Override defaultLocale dynamically
    const dynamicRouting = {
        ...routing,
        defaultLocale
    };

    // 3. Create fresh intlMiddleware with dynamic routing config
    const intlMiddleware = createMiddleware(dynamicRouting);

    // 4. Apply next-intl middleware for locale routing on all requests
    return intlMiddleware(req);
});

export const config = {
    // Match only internationalized pathnames
    // Also ignore static files and API routes
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};