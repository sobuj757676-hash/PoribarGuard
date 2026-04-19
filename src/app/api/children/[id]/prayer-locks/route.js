import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// PUT — Toggle prayer lock isActive
export async function PUT(request, { params }) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: childId } = await params;
    const { prayerLockId, isActive } = await request.json();

    if (!prayerLockId || isActive === undefined) {
        return NextResponse.json(
            { error: "prayerLockId and isActive are required" },
            { status: 400 }
        );
    }

    // Verify child belongs to parent
    // Check subscription access for prayer_lock
    const access = await checkSubscriptionAccess(session.user.id, "prayer_lock");
    if (!access.hasAccess) {
        return NextResponse.json({ error: access.message, reason: access.reason }, { status: 403 });
    }

    const child = await prisma.child.findFirst({
        where: { id: childId, parentId: session.user.id },
    });

    if (!child) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Verify prayer lock belongs to this child
    const prayerLock = await prisma.prayerTimeLock.findFirst({
        where: { id: prayerLockId, childId },
    });

    if (!prayerLock) {
        return NextResponse.json({ error: "Prayer lock not found" }, { status: 404 });
    }

    const updated = await prisma.prayerTimeLock.update({
        where: { id: prayerLockId },
        data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json(updated);
}
