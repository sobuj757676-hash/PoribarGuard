import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// GET all APK releases
export async function GET(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const releases = await prisma.apkRelease.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, count: releases.length, data: releases });
    } catch (error) {
        console.error('API GET Admin APK Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// PUT to set an APK as LIVE (and archive others)
export async function PUT(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'APK Release ID is required' }, { status: 400 });
        }

        // Transaction to ensure atomic update
        const result = await prisma.$transaction(async (tx) => {
            // First, get the target release to find out its appType
            const targetRelease = await tx.apkRelease.findUnique({
                where: { id }
            });

            if (!targetRelease) {
                throw new Error('Release not found');
            }

            // 1. Archive all current LIVE releases of the SAME appType
            await tx.apkRelease.updateMany({
                where: {
                    status: 'LIVE',
                    appType: targetRelease.appType
                },
                data: { status: 'ARCHIVED' }
            });

            // 2. Set the target release to LIVE
            const updated = await tx.apkRelease.update({
                where: { id },
                data: { status: 'LIVE' }
            });

            return updated;
        });

        return NextResponse.json({ success: true, message: 'Release activated successfully', data: result });
    } catch (error) {
        console.error('API PUT Admin APK Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE an APK release
export async function DELETE(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'APK Release ID is required' }, { status: 400 });
        }

        const release = await prisma.apkRelease.findUnique({ where: { id } });
        if (!release) {
            return NextResponse.json({ error: 'Release not found' }, { status: 404 });
        }

        if (release.status === 'LIVE') {
            return NextResponse.json({ error: 'Cannot delete the currently LIVE release.' }, { status: 400 });
        }

        // Delete from DB
        await prisma.apkRelease.delete({ where: { id } });

        // Attempt to delete the physical file
        try {
            const filePath = join(process.cwd(), release.filePath);
            if (existsSync(filePath)) {
                await unlink(filePath);
                console.log(`Deleted APK file from disk: ${filePath}`);
            }
        } catch (fsError) {
            console.error(`Failed to delete file from disk: ${fsError.message}`);
            // Non-fatal, proceed with returning success since DB record is deleted
        }

        return NextResponse.json({ success: true, message: 'Release deleted successfully' });
    } catch (error) {
        console.error('API DELETE Admin APK Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
