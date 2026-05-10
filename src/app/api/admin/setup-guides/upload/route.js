import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || !session.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate a unique filename
        const ext = path.extname(file.name) || '.jpg';
        const filename = `guide_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
        
        // Ensure /public/guides directory exists
        const guidesDir = path.join(process.cwd(), 'public', 'guides');
        try {
            await mkdir(guidesDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        const filepath = path.join(guidesDir, filename);

        // Write the file
        await writeFile(filepath, buffer);

        // Return the public URL path
        return NextResponse.json({ url: `/guides/${filename}` });
        
    } catch (error) {
        console.error("Setup Guide Upload Error:", error);
        return NextResponse.json({ error: 'Failed to upload image', details: error.message }, { status: 500 });
    }
}
