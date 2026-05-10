import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { ticketId } = params;

        // Verify access to the ticket
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: ticketId },
            select: { requesterId: true }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        if (session.user.role !== 'ADMIN' && ticket.requesterId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized access to ticket' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const messageId = formData.get('messageId'); // optional

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // basic validation
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Calculate SHA256 (for integrity/dedup if needed later)
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');

        // Generate unique storage name
        const ext = path.extname(file.name) || '';
        const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
        const relativeKey = path.posix.join(ticketId, filename); // store using posix path for cross-platform
        const storageDir = path.join(process.cwd(), 'storage', 'tickets', ticketId);
        
        try {
            await mkdir(storageDir, { recursive: true });
        } catch (e) {}

        const filepath = path.join(storageDir, filename);

        await writeFile(filepath, buffer);

        // Create attachment record
        const attachment = await prisma.supportTicketAttachment.create({
            data: {
                ticketId,
                messageId: messageId || null,
                originalName: file.name,
                mimeType: file.type,
                sizeBytes: file.size,
                sha256: hash,
                storageKey: relativeKey,
            }
        });

        return NextResponse.json({ attachment }, { status: 201 });
    } catch (error) {
        console.error("Support Attachment Upload Error:", error);
        return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
    }
}
