import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/api-utils";

// GET /api/support/tickets/[ticketId] — ticket + messages for requester
export async function GET(request, { params }) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "PARENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticketId = params.ticketId;
    if (!ticketId) {
        return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findFirst({
        where: {
            id: ticketId,
            requesterId: session.user.id,
        },
        include: {
            messages: {
                where: { isInternal: false },
                orderBy: { createdAt: "asc" },
                include: { attachments: true }
            },
            attachments: true
        },
    });

    if (!ticket) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
}

