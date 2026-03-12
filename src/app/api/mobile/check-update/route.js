import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// High performance mobile endpoint to check for the latest LIVE APK update
export async function GET(req) {
    try {
        const liveRelease = await prisma.apkRelease.findFirst({
            where: { status: 'LIVE', appType: 'CHILD' },
            orderBy: { createdAt: 'desc' } // Guard in case of multiple LIVE accidentally
        });

        if (!liveRelease) {
            return NextResponse.json({ success: false, error: 'No live update available' }, { status: 404 });
        }

        // The downloadUrl points to the secure download endpoint we already have, 
        // or a direct public path if preferred. We'll use the existing /api/child-apk/download endpoint.
        // Wait, the existing endpoint serves a static file. We need to update that endpoint or use a direct URL.
        // Since the wizard needs the bypass, we should keep the download simple. Let's return the API download link.

        return NextResponse.json({
            success: true,
            data: {
                version: liveRelease.version,
                buildNumber: liveRelease.buildNumber,
                targetSdk: liveRelease.targetSdk,
                fileSize: liveRelease.fileSize,
                downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/child-apk/download?id=${liveRelease.id}`,
                releaseNotes: liveRelease.releaseNotes,
                isCriticalUpdate: liveRelease.isCriticalUpdate,
                publishedAt: liveRelease.updatedAt
            }
        });

    } catch (error) {
        console.error('API GET Mobile Check-Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
