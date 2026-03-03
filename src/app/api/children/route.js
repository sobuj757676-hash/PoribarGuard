import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// GET — List all children for current parent
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const children = await prisma.child.findMany({
        where: { parentId: session.user.id },
        orderBy: { createdAt: "asc" },
        include: {
            device: {
                select: {
                    id: true,
                    deviceId: true,
                    model: true,
                    osVersion: true,
                    batteryLevel: true,
                    networkType: true,
                    isOnline: true,
                    lastSeenAt: true,
                    latitude: true,
                    longitude: true,
                    speed: true,
                    locationName: true,
                    locationUpdatedAt: true,
                },
            },
            alerts: {
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    type: true,
                    title: true,
                    severity: true,
                    isRead: true,
                    createdAt: true,
                },
            },
            appControls: {
                select: {
                    id: true,
                    packageName: true,
                    appName: true,
                    isBlocked: true,
                    dailyLimit: true,
                    usageToday: true,
                    iconColor: true,
                },
            },
            prayerLocks: {
                select: {
                    id: true,
                    name: true,
                    startTime: true,
                    endTime: true,
                    isActive: true,
                },
            },
            geofences: {
                select: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    radius: true,
                    isActive: true,
                },
            },
        },
    });

    return NextResponse.json({ children });
}

// POST — Add a new child
export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, age, phone } = await request.json();

    if (!name || !age) {
        return NextResponse.json(
            { error: "Name and age are required" },
            { status: 400 }
        );
    }

    if (age < 3 || age > 18) {
        return NextResponse.json(
            { error: "Age must be between 3 and 18" },
            { status: 400 }
        );
    }

    // Generate a unique 6-digit pairing code
    let pairingCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
        pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await prisma.child.findUnique({ where: { pairingCode } });
        if (!existing) isUnique = true;
        attempts++;
    }

    if (!isUnique) {
        return NextResponse.json({ error: "Failed to generate pairing code. Try again." }, { status: 500 });
    }

    // Code expires in 48 hours for security
    const pairingExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const child = await prisma.child.create({
        data: {
            name,
            age: parseInt(age),
            phone: phone || null,
            parentId: session.user.id,
            pairingCode,
            pairingExpiresAt,
            isPaired: false,
        },
    });

    return NextResponse.json(child, { status: 201 });
}
