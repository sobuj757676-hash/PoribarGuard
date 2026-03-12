import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        let apkRecord;

        // If an ID is requested, fetch that specific version (useful for admin testing).
        // Otherwise, fetch the single LIVE production version.
        if (id) {
            apkRecord = await prisma.apkRelease.findUnique({ where: { id } });
        } else {
            apkRecord = await prisma.apkRelease.findFirst({
                where: { status: 'LIVE', appType: 'CHILD' },
                orderBy: { createdAt: 'desc' }
            });
        }

        if (!apkRecord) {
            return NextResponse.json({ error: 'No APK release found.' }, { status: 404 });
        }

        const apkPath = path.join(process.cwd(), apkRecord.filePath);

        if (!fs.existsSync(apkPath)) {
            return NextResponse.json({ error: 'APK file missing from disk.' }, { status: 404 });
        }

        const stats = fs.statSync(apkPath);
        const fileBuffer = fs.readFileSync(apkPath);

        const headers = new Headers();
        headers.set('Content-Type', 'application/vnd.android.package-archive');
        headers.set('Content-Disposition', `attachment; filename="poribarguard-child-${apkRecord.version}.apk"`);
        headers.set('Content-Length', stats.size.toString());

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: headers
        });
    } catch (error) {
        console.error('Error serving child APK:', error);
        return NextResponse.json({ error: 'Internal server error while serving APK' }, { status: 500 });
    }
}
