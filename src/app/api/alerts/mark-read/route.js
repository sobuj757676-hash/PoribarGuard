import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// POST — Mark alerts as read
export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId, alertId } = await request.json();

    // Get parent's children IDs for ownership verification
    const children = await prisma.child.findMany({
        where: { parentId: session.user.id },
        select: { id: true },
    });
    const childIds = children.map((c) => c.id);

    if (childIds.length === 0) {
        return NextResponse.json({ error: "No children found" }, { status: 404 });
    }

    if (alertId) {
        // Mark single alert as read
        const alert = await prisma.alert.findFirst({
            where: { id: alertId, childId: { in: childIds } },
        });
        if (!alert) {
            return NextResponse.json({ error: "Alert not found" }, { status: 404 });
        }
        await prisma.alert.update({
            where: { id: alertId },
            data: { isRead: true },
        });
        return NextResponse.json({ message: "Alert marked as read" });
    }

    if (childId && childIds.includes(childId)) {
        // Mark all alerts for a specific child as read
        await prisma.alert.updateMany({
            where: { childId, isRead: false },
            data: { isRead: true },
        });
        return NextResponse.json({ message: "All alerts marked as read" });
    }

    // Mark all alerts for all children as read
    await prisma.alert.updateMany({
        where: { childId: { in: childIds }, isRead: false },
        data: { isRead: true },
    });

    return NextResponse.json({ message: "All alerts marked as read" });
}
