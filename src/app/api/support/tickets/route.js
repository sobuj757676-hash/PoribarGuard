import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimit, checkCsrf, sanitize, validateRequired } from "@/lib/api-utils";

// GET /api/support/tickets — list tickets for logged-in parent
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "PARENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const q = searchParams.get("q")?.trim();

    const where = {
        requesterId: session.user.id,
    };
    if (status) where.status = status;
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
        }),
        prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
        tickets,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

// POST /api/support/tickets — create new ticket
export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;

    const session = await auth();
    if (!session?.user || session.user.role !== "PARENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const error = validateRequired(body, ["title", "description"]);
    if (error) {
        return NextResponse.json({ error }, { status: 400 });
    }

    const title = sanitize(body.title, 200);
    const description = sanitize(body.description, 4000);
    const category = body.category ? sanitize(body.category, 100) : null;
    const attachmentIds = body.attachmentIds || [];
    const priority = ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(body.priority)
        ? body.priority
        : "MEDIUM";

    const ticket = await prisma.supportTicket.create({
        data: {
            title,
            description,
            category,
            priority,
            requesterId: session.user.id,
            status: "OPEN",
            lastRequesterMessageAt: new Date(),
            messageCount: 1,
            unreadByAgent: 1,
            messages: {
                create: {
                    authorUserId: session.user.id,
                    authorRole: "REQUESTER",
                    type: "MESSAGE",
                    body: description,
                    isInternal: false,
                },
            },
            auditLogs: {
                create: [
                    {
                        actorUserId: session.user.id,
                        actorRole: "REQUESTER",
                        action: "TICKET_CREATED",
                        meta: {},
                    },
                    {
                        actorUserId: session.user.id,
                        actorRole: "REQUESTER",
                        action: "MESSAGE_POSTED",
                        meta: { initial: true },
                    },
                ],
            },
        },
    });

    if (attachmentIds.length > 0) {
        const firstMessage = ticket.messages[0];
        if (firstMessage) {
            await prisma.supportTicketAttachment.updateMany({
                where: { id: { in: attachmentIds }, ticketId: ticket.id },
                data: { messageId: firstMessage.id }
            });
        }
    }

    // Trigger real-time update
    if (global.io) {
        global.io.to('admin_all').emit('ticket_created', ticket);
    }

    return NextResponse.json({ ticket }, { status: 201 });
}

