import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        
        const { attachmentId } = params;

        const attachment = await prisma.supportTicketAttachment.findUnique({
            where: { id: attachmentId },
            include: {
                ticket: {
                    select: { requesterId: true }
                }
            }
        });

        if (!attachment) {
            return new NextResponse('Attachment not found', { status: 404 });
        }

        // Auth check
        if (session.user.role !== 'ADMIN' && attachment.ticket.requesterId !== session.user.id) {
            return new NextResponse('Unauthorized access to attachment', { status: 403 });
        }

        // Safe path construction (no traversing out of storage/tickets)
        const safeKey = attachment.storageKey.split('/').join(path.sep);
        const filepath = path.join(process.cwd(), 'storage', 'tickets', safeKey);

        let fileBuffer;
        try {
            fileBuffer = await readFile(filepath);
        } catch (e) {
            return new NextResponse('File missing on disk', { status: 404 });
        }

        // Return file
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': attachment.mimeType || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${encodeURIComponent(attachment.originalName)}"`,
            }
        });
    } catch (error) {
        console.error("Support Attachment Download Error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
