import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";
import NotificationService from "@/lib/notification-service";

// GET — List all support tickets (admin only)
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // OPEN | IN_PROGRESS | RESOLVED | CLOSED
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo === "unassigned") {
        where.assignedToId = null;
    } else if (assignedTo) {
        where.assignedToId = assignedTo;
    }
    if (q) {
        where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
        ];
    }

    const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { lastMessageAt: "desc" },
            include: {
                requester: {
                    select: { id: true, name: true, email: true, phone: true, country: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        }),
        prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
        tickets: tickets.map((t) => ({
            id: t.id,
            ticketNumber: t.ticketNumber,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            category: t.category,
            tags: t.tags,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            lastMessageAt: t.lastMessageAt,
            messageCount: t.messageCount,
            unreadByAgent: t.unreadByAgent,
            requester: t.requester,
            assignedTo: t.assignedTo,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

// PUT — Update ticket fields (status / priority / assignedTo / tags) (admin only)
export async function PUT(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, status, priority, assignedToId, tags } = await request.json();

    if (!ticketId) {
        return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    const data = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
    if (Array.isArray(tags)) data.tags = tags;

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const before = await prisma.supportTicket.findUnique({ 
        where: { id: ticketId },
        include: { requester: true }
    });
    if (!before) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ticket = await prisma.$transaction(async (tx) => {
        const updated = await tx.supportTicket.update({
            where: { id: ticketId },
            data,
        });

        await tx.ticketAuditLog.create({
            data: {
                ticketId,
                actorUserId: session.user.id,
                actorRole: "AGENT",
                action: "TICKET_UPDATED",
                meta: {
                    before: {
                        status: before.status,
                        priority: before.priority,
                        assignedToId: before.assignedToId,
                        tags: before.tags,
                    },
                    after: {
                        status: updated.status,
                        priority: updated.priority,
                        assignedToId: updated.assignedToId,
                        tags: updated.tags,
                    },
                },
            },
        });

        return updated;
    });

    // Real-time updates
    if (global.io) {
        global.io.to(`admin_all`).emit('ticket_updated', ticket);
        if (before.requesterId) {
            global.io.to(`parent_${before.requesterId}`).emit('ticket_updated', ticket);
        }
    }

    if (status && status !== before.status && before.requester?.email) {
        NotificationService.sendEmail(
            before.requester.email,
            `Status Updated: Support Ticket #${ticket.ticketNumber}`,
            `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>ProibarGuard BD Support</h2>
                <p>The status of your ticket <b>#${ticket.ticketNumber} (${ticket.title})</b> has been updated.</p>
                <div style="padding: 15px; border-left: 4px solid #10b981; background: #f9fafb; margin: 20px 0;">
                    <b>Old Status:</b> ${before.status}<br/>
                    <b>New Status:</b> ${status}
                </div>
                <p>Log into your parent dashboard for more details.</p>
            </div>
            `
        ).catch(err => console.error("Failed to send status update email:", err));
    }

    return NextResponse.json({ ticket, message: "Ticket updated" });
}
