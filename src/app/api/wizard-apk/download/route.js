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

        if (id) {
            apkRecord = await prisma.apkRelease.findUnique({ where: { id } });
        } else {
            apkRecord = await prisma.apkRelease.findFirst({
                where: { status: 'LIVE', appType: 'WIZARD' },
                orderBy: { createdAt: 'desc' }
            });
        }

        if (!apkRecord) {
            return NextResponse.json({ error: 'No Wizard APK release found.' }, { status: 404 });
        }

        const apkPath = path.join(process.cwd(), apkRecord.filePath);

        if (!fs.existsSync(apkPath)) {
            return NextResponse.json({ error: 'Wizard APK file missing from disk.' }, { status: 404 });
        }

        const stats = fs.statSync(apkPath);
        const fileBuffer = fs.readFileSync(apkPath);

        const headers = new Headers();
        headers.set('Content-Type', 'application/vnd.android.package-archive');
        headers.set('Content-Disposition', `attachment; filename="poribarguard-wizard-${apkRecord.version}.apk"`);
        headers.set('Content-Length', stats.size.toString());

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: headers
        });
    } catch (error) {
        console.error('Error serving wizard APK:', error);
        return NextResponse.json({ error: 'Internal server error while serving Wizard APK' }, { status: 500 });
    }
}
