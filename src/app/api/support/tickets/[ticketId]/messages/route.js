import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimit, checkCsrf, sanitize } from "@/lib/api-utils";
import NotificationService from "@/lib/notification-service";

// POST /api/support/tickets/[ticketId]/messages — requester reply
export async function POST(request, { params }) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;

    const session = await auth();
    if (!session?.user || session.user.role !== "PARENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticketId = params.ticketId;
    if (!ticketId) {
        return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    const bodyJson = await request.json().catch(() => ({}));
    const rawBody = typeof bodyJson.body === "string" ? bodyJson.body : "";
    const clientMessageId = bodyJson.clientMessageId || null;
    const attachmentIds = bodyJson.attachmentIds || [];
    const body = sanitize(rawBody, 4000);

    if (!body && attachmentIds.length === 0) {
        return NextResponse.json({ error: "body or attachment is required" }, { status: 400 });
    }

    // Ensure ticket belongs to this requester
    const ticket = await prisma.supportTicket.findFirst({
        where: { id: ticketId, requesterId: session.user.id },
        include: { assignedTo: true }
    });

    if (!ticket) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Idempotent check
    if (clientMessageId) {
        const existing = await prisma.supportTicketMessage.findUnique({
            where: { clientMessageId },
        });
        if (existing) {
            return NextResponse.json({ message: existing, ticketId }, { status: 200 });
        }
    }

    const now = new Date();

    const message = await prisma.$transaction(async (tx) => {
        const msg = await tx.supportTicketMessage.create({
            data: {
                ticketId,
                authorUserId: session.user.id,
                authorRole: "REQUESTER",
                type: "MESSAGE",
                body,
                isInternal: false,
                clientMessageId,
            },
        });

        await tx.supportTicket.update({
            where: { id: ticketId },
            data: {
                lastMessageAt: now,
                lastRequesterMessageAt: now,
                messageCount: { increment: 1 },
                unreadByAgent: { increment: 1 },
            },
        });

        if (attachmentIds.length > 0) {
            await tx.supportTicketAttachment.updateMany({
                where: { id: { in: attachmentIds }, ticketId: ticketId },
                data: { messageId: msg.id }
            });
        }

        await tx.ticketAuditLog.create({
            data: {
                ticketId,
                actorUserId: session.user.id,
                actorRole: "REQUESTER",
                action: "MESSAGE_POSTED",
                meta: {},
            },
        });

        return msg;
    });

    if (global.io) {
        global.io.to(`admin_all`).emit('ticket_message_created', { ticketId, message: msg });
        if (ticket.assignedToId) {
            global.io.to(`admin_${ticket.assignedToId}`).emit('ticket_message_created', { ticketId, message: msg });
        }
    }

    if (ticket.assignedTo?.email) {
        NotificationService.sendEmail(
            ticket.assignedTo.email,
            `New Reply: Ticket #${ticket.ticketNumber}`,
            `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>ProibarGuard BD Admin Alerts</h2>
                <p>The parent has replied to ticket <b>#${ticket.ticketNumber} (${ticket.title})</b>.</p>
                <div style="padding: 15px; border-left: 4px solid #4f46e5; background: #f9fafb; margin: 20px 0;">
                    ${body}
                </div>
                <p>Please log into the Admin panel to view the thread.</p>
            </div>
            `
        ).catch(err => console.error("Failed to send notification email to agent:", err));
    }

    return NextResponse.json({ message }, { status: 201 });
}

