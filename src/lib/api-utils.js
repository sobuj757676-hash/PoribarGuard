import { NextResponse } from 'next/server';

// Simple in-memory rate limiter (per IP, per window)
const requests = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60;     // 60 requests per minute

function getClientIP(request) {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
}

/**
 * Rate limit check. Returns null if OK, or a Response if rate limited.
 */
export function rateLimit(request) {
    const ip = getClientIP(request);
    const now = Date.now();

    if (!requests.has(ip)) {
        requests.set(ip, { count: 1, windowStart: now });
        return null;
    }

    const entry = requests.get(ip);

    if (now - entry.windowStart > WINDOW_MS) {
        // Reset window
        entry.count = 1;
        entry.windowStart = now;
        return null;
    }

    entry.count++;

    if (entry.count > MAX_REQUESTS) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    return null;
}

/**
 * Validate that required fields are present and non-empty.
 * @param {Object} body - Request body
 * @param {string[]} fields - Required field names
 * @returns {string|null} Error message or null if valid
 */
export function validateRequired(body, fields) {
    for (const field of fields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
            return `${field} is required`;
        }
    }
    return null;
}

/**
 * Sanitize string input — trim whitespace and limit length.
 */
export function sanitize(value, maxLength = 500) {
    if (typeof value !== 'string') return value;
    return value.trim().slice(0, maxLength);
}

/**
 * CSRF Protection — validates Origin header matches the host.
 * Call this on POST/PUT/DELETE routes.
 * Returns null if OK, or a Response if origin mismatch.
 */
export function checkCsrf(request) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (!origin || !host) return null; // Skip for server-to-server or same-origin without header
    try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
            return NextResponse.json(
                { error: 'Forbidden — origin mismatch' },
                { status: 403 }
            );
        }
    } catch {
        return NextResponse.json(
            { error: 'Forbidden — invalid origin' },
            { status: 403 }
        );
    }
    return null;
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of requests.entries()) {
            if (now - entry.windowStart > WINDOW_MS * 5) {
                requests.delete(ip);
            }
        }
    }, 5 * 60 * 1000);
}
