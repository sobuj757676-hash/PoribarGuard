import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// GET — List devices for current parent's children
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const children = await prisma.child.findMany({
        where: { parentId: session.user.id },
        select: {
            id: true,
            name: true,
            age: true,
            device: true,
        },
    });

    return NextResponse.json({
        devices: children.map((c) => ({
            childId: c.id,
            childName: c.name,
            childAge: c.age,
            ...(c.device || { status: "NOT_REGISTERED" }),
        })),
    });
}

// POST — Register a device to a child
export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId, deviceId, model, osVersion } = await request.json();

    if (!childId || !deviceId) {
        return NextResponse.json(
            { error: "childId and deviceId are required" },
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

    // Check if device already exists
    const existingDevice = await prisma.device.findUnique({
        where: { deviceId },
    });

    if (existingDevice) {
        return NextResponse.json(
            { error: "Device already registered" },
            { status: 409 }
        );
    }

    const device = await prisma.device.create({
        data: {
            deviceId,
            model: model || null,
            osVersion: osVersion || null,
            childId,
        },
    });

    return NextResponse.json(device, { status: 201 });
}
