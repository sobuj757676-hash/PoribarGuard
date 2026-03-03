import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, sanitize, checkCsrf } from "@/lib/api-utils";

// GET — Return current user profile
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
            city: true,
            avatarUrl: true,
            createdAt: true,
        },
    });

    return NextResponse.json({ user });
}

// PUT — Update current user profile
export async function PUT(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = {};

    if (body.name !== undefined) data.name = sanitize(body.name, 100);
    if (body.phone !== undefined) data.phone = sanitize(body.phone, 20) || null;
    if (body.country !== undefined) data.country = sanitize(body.country, 50) || null;
    if (body.city !== undefined) data.city = sanitize(body.city, 100) || null;

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
            city: true,
        },
    });

    return NextResponse.json({ user, message: "Profile updated successfully" });
}
