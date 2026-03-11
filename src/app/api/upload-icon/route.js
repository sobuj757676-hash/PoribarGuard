import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const formData = await req.formData();
        const childId = formData.get('childId');
        const packageName = formData.get('packageName');
        const iconFile = formData.get('icon');

        if (!childId || !packageName || !iconFile) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const buffer = Buffer.from(await iconFile.arrayBuffer());

        // Ensure the directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'icons');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Save file
        const filename = `${childId}_${packageName}.png`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);

        const iconUrl = `/uploads/icons/${filename}`;

        // Update database (only if the AppControl record already exists)
        await prisma.appControl.updateMany({
            where: {
                childId: childId,
                packageName: packageName
            },
            data: {
                iconUrl: iconUrl
            }
        });

        return NextResponse.json({ success: true, iconUrl });

    } catch (error) {
        console.error('Upload icon error:', error);
        return NextResponse.json({ error: 'Failed to upload icon' }, { status: 500 });
    }
}
