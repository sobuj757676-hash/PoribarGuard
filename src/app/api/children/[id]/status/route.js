import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request, { params }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const child = await prisma.child.findUnique({
        where: { id },
        select: {
            isPaired: true,
            pairingCode: true
        }
    });

    if (!child) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json(child);
}
