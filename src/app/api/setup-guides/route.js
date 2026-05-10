import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh');

        const guides = await prisma.setupGuide.findMany();

        return NextResponse.json(guides, { 
            status: 200,
            headers: {
                'Cache-Control': forceRefresh ? 'no-store, max-age=0' : 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });
    } catch (error) {
        console.error('Failed to fetch public setup guides:', error);
        return NextResponse.json({ error: 'Failed to fetch setup guides' }, { status: 500 });
    }
}
