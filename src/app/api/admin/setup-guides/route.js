import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to check admin auth
async function checkAdmin() {
    const session = await auth();
    if (!session || !session.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        return false;
    }
    return true;
}

export async function GET() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const guides = await prisma.setupGuide.findMany({
            orderBy: [
                { oem: 'asc' },
                { stepId: 'asc' }
            ]
        });
        return NextResponse.json(guides);
    } catch (error) {
        console.error('Failed to fetch setup guides:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { id, stepId, oem, skinName, titleEn, titleBn, instructionEn, instructionBn, screenshotUrl } = body;

        if (!stepId || !oem || !titleEn || !titleBn || !instructionEn || !instructionBn) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let guide;
        
        if (id) {
            // Update
            guide = await prisma.setupGuide.update({
                where: { id },
                data: { stepId, oem, skinName: skinName || null, titleEn, titleBn, instructionEn, instructionBn, screenshotUrl }
            });
        } else {
            // Null + unique constraints can behave differently across DBs,
            // so we do a manual duplicate check and upsert-like behavior.
            const duplicateCheck = await prisma.setupGuide.findFirst({
                where: {
                    stepId,
                    oem,
                    skinName: skinName || null
                }
            });

            if (duplicateCheck) {
                 guide = await prisma.setupGuide.update({
                    where: { id: duplicateCheck.id },
                    data: { titleEn, titleBn, instructionEn, instructionBn, screenshotUrl }
                 });
            } else {
                 guide = await prisma.setupGuide.create({
                    data: { stepId, oem, skinName: skinName || null, titleEn, titleBn, instructionEn, instructionBn, screenshotUrl }
                 });
            }
        }

        return NextResponse.json(guide);
    } catch (error) {
        console.error('Failed to save setup guide:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await prisma.setupGuide.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete setup guide:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
