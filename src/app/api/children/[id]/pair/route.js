import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

export async function POST(request, { params }) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const childId = params.id;

    // Verify ownership
    const child = await prisma.child.findUnique({
        where: { id: childId }
    });

    if (!child || child.parentId !== session.user.id) {
        return NextResponse.json({ error: "Child not found or unauthorized" }, { status: 404 });
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

    const updatedChild = await prisma.child.update({
        where: { id: childId },
        data: {
            pairingCode,
            pairingExpiresAt,
            isPaired: false,
        },
    });

    // Optionally delete the existing device if we want to force a clean slate during reconnection
    // The device cleanup is already handled by the hardware ID matching in `/api/devices/pair`
    // But removing it here ensures the dashboard shows "offline/pairing" immediately
    await prisma.device.deleteMany({
        where: { childId: childId }
    });

    return NextResponse.json(updatedChild, { status: 200 });
}
