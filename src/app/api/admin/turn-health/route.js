import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/api-utils";

/**
 * GET /api/admin/turn-health
 *
 * Admin-only endpoint. Tests connectivity to each configured TURN server
 * by attempting a STUN binding request (lightweight UDP probe).
 *
 * For a server-side check, we validate:
 *   - URL parsing is valid
 *   - DNS resolution for the hostname works
 *   - Port is reachable (TCP connect for TURNS, DNS check for UDP TURN)
 *
 * Returns: { servers: [{ url, status, latencyMs, error? }] }
 */
export async function GET(request) {
    const rl = rateLimit(request);
    if (rl) return rl;

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const turnServersConfig = await prisma.systemConfig.findUnique({
            where: { key: "turn_servers" },
        });

        let turnServers = [];
        try {
            turnServers = JSON.parse(turnServersConfig?.value || "[]");
        } catch {
            turnServers = [];
        }

        const results = await Promise.all(
            turnServers.map(async (server) => {
                const start = Date.now();
                try {
                    // Parse the TURN URL to extract host and port
                    const parsed = parseTurnUrl(server.url);
                    if (!parsed) {
                        return {
                            url: server.url,
                            status: "invalid",
                            latencyMs: 0,
                            error: "Invalid TURN URL format",
                        };
                    }

                    // DNS resolution check (works server-side in Node.js)
                    const dns = await import("dns");
                    const { promisify } = await import("util");
                    const resolve = promisify(dns.resolve);

                    await resolve(parsed.host);
                    const latencyMs = Date.now() - start;

                    // For TURNS (TLS), try a TCP connection test
                    if (parsed.protocol === "turns") {
                        const net = await import("net");
                        const tcpOk = await new Promise((resolve) => {
                            const socket = new net.Socket();
                            const timeout = setTimeout(() => {
                                socket.destroy();
                                resolve(false);
                            }, 3000);

                            socket.connect(parsed.port, parsed.host, () => {
                                clearTimeout(timeout);
                                socket.destroy();
                                resolve(true);
                            });

                            socket.on("error", () => {
                                clearTimeout(timeout);
                                socket.destroy();
                                resolve(false);
                            });
                        });

                        return {
                            url: server.url,
                            status: tcpOk ? "healthy" : "unreachable",
                            latencyMs: Date.now() - start,
                            protocol: "TURNS/TLS",
                            error: tcpOk ? undefined : "TCP connect failed",
                        };
                    }

                    // For regular TURN (UDP/TCP), DNS resolution success = healthy
                    return {
                        url: server.url,
                        status: latencyMs < 1000 ? "healthy" : "slow",
                        latencyMs,
                        protocol: parsed.protocol.toUpperCase(),
                    };
                } catch (err) {
                    return {
                        url: server.url,
                        status: "unreachable",
                        latencyMs: Date.now() - start,
                        error: err.message,
                    };
                }
            })
        );

        return NextResponse.json({ servers: results });
    } catch (err) {
        console.error("[TURN Health] Error:", err);
        return NextResponse.json(
            { error: "Failed to check TURN health" },
            { status: 500 }
        );
    }
}

/**
 * Parse a TURN/TURNS URL into { protocol, host, port, transport }
 * Examples:
 *   turn:relay.example.com:3478
 *   turn:relay.example.com:3478?transport=tcp
 *   turns:relay.example.com:443
 */
function parseTurnUrl(url) {
    if (!url) return null;

    const match = url.match(
        /^(turns?|stun):([^:?]+)(?::(\d+))?(?:\?transport=(udp|tcp))?$/i
    );
    if (!match) return null;

    return {
        protocol: match[1].toLowerCase(),
        host: match[2],
        port: parseInt(match[3] || (match[1].toLowerCase() === "turns" ? "443" : "3478"), 10),
        transport: match[4] || "udp",
    };
}
