import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// GET — List all support tickets (admin only)
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // OPEN | IN_PROGRESS | RESOLVED | CLOSED
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where = {};
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
            },
        }),
        prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
        tickets: tickets.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            userName: t.user?.name,
            userEmail: t.user?.email,
            userPhone: t.user?.phone,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

// PUT — Update ticket status (admin only)
export async function PUT(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, status, priority } = await request.json();

    if (!ticketId) {
        return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    const data = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data,
    });

    return NextResponse.json({ ticket, message: "Ticket updated" });
}
