import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from '@/lib/auth';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
    // Apply next-intl middleware for locale routing on all requests
    return intlMiddleware(req);
});

export const config = {
    // Match only internationalized pathnames
    // Also ignore static files and API routes
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};