import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createHmac } from "crypto";

/**
 * GET /api/turn-credentials
 *
 * Public endpoint consumed by:
 *   - Parent dashboard (browser WebRTC)
 *   - Android child app (IceConfigFetcher)
 *
 * Returns a fully-formed { iceServers } array ready for RTCPeerConnection config.
 *
 * Supports three credential modes:
 *   1. Metered.ca API (auto-provisioned)
 *   2. HMAC time-limited credentials (self-hosted TURN)
 *   3. Static credentials (manual)
 */
export async function GET(request) {
    try {
        // Read all TURN-related config from SystemConfig
        const keys = [
            "turn_enabled",
            "turn_servers",
            "turn_secret",
            "turn_credential_ttl",
            "turn_stun_servers",
            "turn_metered_api_key",
        ];

        const configs = await prisma.systemConfig.findMany({
            where: { key: { in: keys } },
        });

        const cfg = {};
        configs.forEach((c) => (cfg[c.key] = c.value));

        // Defaults
        const turnEnabled = cfg.turn_enabled !== "false";
        const ttl = parseInt(cfg.turn_credential_ttl || "86400", 10);
        const stunServersRaw = cfg.turn_stun_servers || '["stun:stun.l.google.com:19302"]';
        const meteredApiKey = cfg.turn_metered_api_key || "";
        const turnSecret = cfg.turn_secret || "";
        const turnServersRaw = cfg.turn_servers || "[]";

        // 1. Always include STUN servers
        let stunUrls = [];
        try {
            stunUrls = JSON.parse(stunServersRaw);
        } catch {
            stunUrls = ["stun:stun.l.google.com:19302"];
        }

        const iceServers = stunUrls.map((url) => ({ urls: url }));

        // If TURN is disabled, return STUN only
        if (!turnEnabled) {
            return NextResponse.json({ iceServers, bandwidth: null });
        }

        // 2. Metered.ca API mode (highest priority)
        if (meteredApiKey) {
            try {
                const meteredRes = await fetch(
                    `https://poribarguard.metered.live/api/v1/turn/credentials?apiKey=${meteredApiKey}`,
                    { next: { revalidate: 300 } } // Cache for 5 minutes
                );

                if (meteredRes.ok) {
                    const meteredServers = await meteredRes.json();
                    // Metered returns an array of { urls, username, credential }
                    if (Array.isArray(meteredServers)) {
                        meteredServers.forEach((s) => {
                            iceServers.push({
                                urls: s.urls || s.url,
                                username: s.username,
                                credential: s.credential,
                            });
                        });
                    }

                    return NextResponse.json({
                        iceServers,
                        source: "metered",
                        bandwidth: await getBandwidthInfo(),
                    });
                }
            } catch (err) {
                console.error("[TURN] Metered.ca API error:", err.message);
                // Fall through to HMAC / static mode
            }
        }

        // 3. Parse manually-configured TURN servers
        let turnServers = [];
        try {
            turnServers = JSON.parse(turnServersRaw);
        } catch {
            turnServers = [];
        }

        // Filter to enabled servers only, sorted by priority
        const enabledServers = turnServers
            .filter((s) => s.enabled !== false)
            .sort((a, b) => (a.priority || 99) - (b.priority || 99));

        // Detect caller region for geo-routing
        const callerCountry = (
            request.headers.get("cf-ipcountry") ||
            request.headers.get("x-vercel-ip-country") ||
            ""
        ).toUpperCase();

        // Geo-sort: prefer servers whose region matches caller country
        const geoSorted = [...enabledServers].sort((a, b) => {
            const aMatch = a.region && a.region.toUpperCase() === callerCountry ? 0 : 1;
            const bMatch = b.region && b.region.toUpperCase() === callerCountry ? 0 : 1;
            return aMatch - bMatch;
        });

        // Generate credentials for each server
        const expiry = Math.floor(Date.now() / 1000) + ttl;

        for (const server of geoSorted) {
            const entry = { urls: server.url };

            if (server.username && server.credential) {
                // Static credentials mode
                entry.username = server.username;
                entry.credential = server.credential;
            } else if (turnSecret) {
                // HMAC time-limited credentials mode
                const username = `${expiry}`;
                const credential = createHmac("sha1", turnSecret)
                    .update(username)
                    .digest("base64");
                entry.username = username;
                entry.credential = credential;
            }
            // else: no credentials (some TURN servers have open access)

            iceServers.push(entry);
        }

        return NextResponse.json({
            iceServers,
            source: turnSecret ? "hmac" : "static",
            bandwidth: await getBandwidthInfo(),
        });
    } catch (err) {
        console.error("[TURN] Credentials endpoint error:", err);
        // Fallback: return Google STUN so calls don't completely fail
        return NextResponse.json({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            source: "fallback",
            bandwidth: null,
        });
    }
}

/**
 * Helper: read bandwidth tracking from SystemConfig
 */
async function getBandwidthInfo() {
    try {
        const [used, limit] = await Promise.all([
            prisma.systemConfig.findUnique({ where: { key: "turn_bandwidth_used_mb" } }),
            prisma.systemConfig.findUnique({ where: { key: "turn_bandwidth_limit_mb" } }),
        ]);

        const usedMB = parseFloat(used?.value || "0");
        const limitMB = parseFloat(limit?.value || "20480");

        return {
            usedMB: Math.round(usedMB * 10) / 10,
            limitMB,
            percentUsed: limitMB > 0 ? Math.round((usedMB / limitMB) * 1000) / 10 : 0,
        };
    } catch {
        return null;
    }
}
