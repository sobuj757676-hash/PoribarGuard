import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimit, checkCsrf, sanitize } from "@/lib/api-utils";
import NotificationService from "@/lib/notification-service";

// POST /api/admin/tickets/[ticketId]/messages — agent reply or internal note
export async function POST(request, { params }) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticketId = params.ticketId;
    if (!ticketId) {
        return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    const bodyJson = await request.json().catch(() => ({}));
    const rawBody = typeof bodyJson.body === "string" ? bodyJson.body : "";
    const clientMessageId = bodyJson.clientMessageId || null;
    const isInternal = !!bodyJson.isInternal;
    const attachmentIds = bodyJson.attachmentIds || [];
    const body = sanitize(rawBody, 4000);

    if (!body && attachmentIds.length === 0) {
        return NextResponse.json({ error: "body or attachment is required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: { requester: true }
    });
    if (!ticket) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
                authorRole: "AGENT",
                type: isInternal ? "NOTE" : "MESSAGE",
                body,
                isInternal,
                clientMessageId,
            },
        });

        await tx.supportTicket.update({
            where: { id: ticketId },
            data: {
                lastMessageAt: now,
                lastAgentMessageAt: now,
                messageCount: { increment: 1 },
                unreadByRequester: isInternal ? undefined : { increment: 1 },
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
                actorRole: "AGENT",
                action: isInternal ? "INTERNAL_NOTE_ADDED" : "MESSAGE_POSTED",
                meta: {},
            },
        });

        return msg;
    });

    if (global.io) {
        global.io.to(`admin_all`).emit('ticket_message_created', { ticketId, message: msg });
        if (!isInternal && ticket.requesterId) {
            global.io.to(`parent_${ticket.requesterId}`).emit('ticket_message_created', { ticketId, message: msg });
        }
    }

    if (!isInternal && ticket.requester?.email) {
        // Fire and forget email notification
        NotificationService.sendEmail(
            ticket.requester.email,
            `Update on your Support Ticket #${ticket.ticketNumber}`,
            `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>ProibarGuard BD Support</h2>
                <p>An agent has replied to your ticket <b>#${ticket.ticketNumber} (${ticket.title})</b>.</p>
                <div style="padding: 15px; border-left: 4px solid #10b981; background: #f9fafb; margin: 20px 0;">
                    ${body}
                </div>
                <p>Log into your parent dashboard to reply or view attachments.</p>
            </div>
            `
        ).catch(err => console.error("Failed to send notification email:", err));
    }

    return NextResponse.json({ message }, { status: 201 });
}

