import withPWAInit from '@ducanh2912/next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in dev
  workboxOptions: {
    disableDevLogs: true,
  },
  fallbacks: {
    // Defines the offline route. Note that with next-intl,
    // it's tricky to cache a dynamic localized fallback cleanly out of the box,
    // so we map to the base english offline route here for safety.
    document: '/en/~offline',
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default withNextIntl(withPWA(nextConfig));