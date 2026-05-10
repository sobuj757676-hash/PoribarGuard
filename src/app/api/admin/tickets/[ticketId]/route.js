import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/api-utils";

// GET /api/admin/tickets/[ticketId] — ticket + full message thread (including internal)
export async function GET(request, { params }) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticketId = params.ticketId;
    if (!ticketId) {
        return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
            requester: {
                select: { id: true, name: true, email: true, phone: true, country: true },
            },
            assignedTo: {
                select: { id: true, name: true, email: true },
            },
            messages: {
                orderBy: { createdAt: "asc" },
                include: { attachments: true }
            },
            attachments: true,
        },
    });

    if (!ticket) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
}

