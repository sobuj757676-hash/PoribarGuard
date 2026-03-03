import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// GET — Single child detail
export async function GET(request, { params }) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const child = await prisma.child.findFirst({
        where: { id, parentId: session.user.id },
        include: {
            device: true,
            alerts: { orderBy: { createdAt: "desc" }, take: 20 },
            appControls: true,
            prayerLocks: true,
            geofences: true,
        },
    });

    if (!child) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json(child);
}

// PUT — Update child profile
export async function PUT(request, { params }) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.child.findFirst({
        where: { id, parentId: session.user.id },
    });

    if (!existing) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = {};
    if (body.name) data.name = body.name;
    if (body.age) data.age = parseInt(body.age);
    if (body.phone !== undefined) data.phone = body.phone || null;

    const child = await prisma.child.update({ where: { id }, data });

    return NextResponse.json(child);
}

// DELETE — Remove a child
export async function DELETE(request, { params }) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.child.findFirst({
        where: { id, parentId: session.user.id },
    });

    if (!existing) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    await prisma.child.delete({ where: { id } });

    return NextResponse.json({ message: "Child removed" });
}
