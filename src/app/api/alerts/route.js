import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// GET — List alerts for current parent's children
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    // Get parent's children IDs
    const children = await prisma.child.findMany({
        where: { parentId: session.user.id },
        select: { id: true },
    });
    const childIds = children.map((c) => c.id);

    if (childIds.length === 0) {
        return NextResponse.json({ alerts: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    const where = { childId: { in: childIds } };
    if (childId && childIds.includes(childId)) {
        where.childId = childId;
    }

    const [alerts, total] = await Promise.all([
        prisma.alert.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { child: { select: { name: true } } },
        }),
        prisma.alert.count({ where }),
    ]);

    return NextResponse.json({
        alerts: alerts.map((a) => ({
            id: a.id,
            type: a.type,
            title: a.title,
            description: a.description,
            severity: a.severity,
            isRead: a.isRead,
            createdAt: a.createdAt,
            childName: a.child.name,
            childId: a.childId,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

// POST — Create SOS alert (triggered by parent)
export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId, type, title, description } = await request.json();

    if (!childId || !title) {
        return NextResponse.json(
            { error: "childId and title are required" },
            { status: 400 }
        );
    }

    // Verify child belongs to parent
    const child = await prisma.child.findFirst({
        where: { id: childId, parentId: session.user.id },
    });

    if (!child) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const alert = await prisma.alert.create({
        data: {
            type: type || "SOS",
            title,
            description: description || null,
            severity: "CRITICAL",
            childId,
        },
    });

    return NextResponse.json(alert, { status: 201 });
}
