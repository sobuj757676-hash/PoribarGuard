import { checkCsrf } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — List all content filters
export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filters = await prisma.contentFilter.findMany({
        orderBy: { createdAt: "desc" },
    });

    const domains = filters.filter((f) => f.type === "DOMAIN");
    const keywords = filters.filter((f) => f.type === "KEYWORD");

    return NextResponse.json({ domains, keywords });
}

// POST — Add a new content filter
export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pattern, type, category } = await request.json();

    if (!pattern || !type) {
        return NextResponse.json(
            { error: "Pattern and type are required" },
            { status: 400 }
        );
    }

    if (!["DOMAIN", "KEYWORD"].includes(type)) {
        return NextResponse.json(
            { error: 'Type must be "DOMAIN" or "KEYWORD"' },
            { status: 400 }
        );
    }

    // Check duplicate
    const existing = await prisma.contentFilter.findFirst({
        where: { pattern, type },
    });
    if (existing) {
        return NextResponse.json(
            { error: "This pattern already exists" },
            { status: 409 }
        );
    }

    const filter = await prisma.contentFilter.create({
        data: {
            pattern,
            type,
            category: category || null,
            isGlobal: true,
            isActive: true,
        },
    });

    return NextResponse.json(filter, { status: 201 });
}

// DELETE — Remove a content filter
export async function DELETE(request) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
        return NextResponse.json({ error: "Filter ID is required" }, { status: 400 });
    }

    await prisma.contentFilter.delete({ where: { id } });

    return NextResponse.json({ message: "Filter deleted" });
}
