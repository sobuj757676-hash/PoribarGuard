import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// GET — List geofence zones for a child
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    if (!childId) {
        return NextResponse.json({ error: "childId is required" }, { status: 400 });
    }

    // Verify ownership
    const child = await prisma.child.findFirst({
        where: { id: childId, parentId: session.user.id },
    });

    if (!child) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const geofences = await prisma.geofenceZone.findMany({
        where: { childId },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ geofences });
}

// POST — Create a new geofence zone
export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId, name, latitude, longitude, radius } = await request.json();

    if (!childId || !name || latitude == null || longitude == null || !radius) {
        return NextResponse.json(
            { error: "childId, name, latitude, longitude, and radius are required" },
            { status: 400 }
        );
    }

    // Verify ownership
    const child = await prisma.child.findFirst({
        where: { id: childId, parentId: session.user.id },
    });

    if (!child) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const geofence = await prisma.geofenceZone.create({
        data: {
            name,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: parseFloat(radius),
            childId,
        },
    });

    return NextResponse.json(geofence, { status: 201 });
}

// DELETE — Remove a geofence zone
export async function DELETE(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, childId } = await request.json();

    if (!id || !childId) {
        return NextResponse.json(
            { error: "id and childId are required" },
            { status: 400 }
        );
    }

    // Verify ownership
    const child = await prisma.child.findFirst({
        where: { id: childId, parentId: session.user.id },
    });

    if (!child) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    await prisma.geofenceZone.delete({ where: { id } });

    return NextResponse.json({ message: "Geofence zone deleted" });
}
