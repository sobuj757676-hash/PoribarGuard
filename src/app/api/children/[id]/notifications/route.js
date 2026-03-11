import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming lib/prisma exists based on usual Next.js Prisma setup. Let's make sure, or just import from '@prisma/client' like in other routes. Wait, I should import this safely.

// Actually, I can just use:
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

export async function POST(req, { params }) {
    try {
        const id = params.id;
        const body = await req.json();
        const { appName, packageName, senderName, text, timestamp } = body;

        if (!id || !appName || !senderName || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notification = await db.messageNotification.create({
            data: {
                childId: id,
                appName,
                packageName,
                senderName,
                text,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            }
        });

        return NextResponse.json({ success: true, notification });
    } catch (error) {
        console.error('[API] Failed to save notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    try {
        const id = params.id;
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const notifications = await db.messageNotification.findMany({
            where: { childId: id },
            orderBy: { timestamp: 'desc' },
            take: 100 // Limit to last 100 messages for performance
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('[API] Failed to fetch notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
