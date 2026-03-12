import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// Limit file size to ~100MB to prevent memory exhaustion in Next.js
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No APK file uploaded' }, { status: 400 });
        }

        if (!file.name.endsWith('.apk')) {
            return NextResponse.json({ error: 'Invalid file type. Only .apk allowed.' }, { status: 400 });
        }

        // Extract metadata from formData
        const version = formData.get('version');
        const buildNumber = parseInt(formData.get('buildNumber') || '0', 10);
        const targetSdk = parseInt(formData.get('targetSdk') || '34', 10);
        const releaseNotes = formData.get('releaseNotes') || '';
        const isCriticalUpdate = formData.get('isCriticalUpdate') === 'true';
        const appType = formData.get('appType') || 'CHILD'; // 'CHILD' or 'WIZARD'

        if (!version) {
            return NextResponse.json({ error: 'Version string is required' }, { status: 400 });
        }

        // Handle file storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Calculate size in MB
        const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2) + ' MB';

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'apk');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename to prevent overwrites
        const fileName = `child-app-v${version.replace(/\./g, '_')}-b${buildNumber}-${Date.now()}.apk`;
        const filePath = join(uploadDir, fileName);
        const relativeFilePath = `public/uploads/apk/${fileName}`;

        // Write to disk
        await writeFile(filePath, buffer);

        // Save to Database as ARCHIVED initially
        const newRelease = await prisma.apkRelease.create({
            data: {
                appType,
                version,
                buildNumber,
                targetSdk,
                fileSize: sizeMb,
                filePath: relativeFilePath,
                status: 'ARCHIVED',
                isCriticalUpdate,
                releaseNotes,
                uploadedBy: session.user.email || 'Admin',
            }
        });

        return NextResponse.json({ success: true, message: 'APK uploaded successfully', data: newRelease });

    } catch (error) {
        console.error('API POST Admin APK Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
