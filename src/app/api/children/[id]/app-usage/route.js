import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/children/[id]/app-usage
 * Called by the Socket.IO server to persist app usage data from the child device.
 *
 * Body: { apps: [{ packageName, appName, usageMinutes, lastUsed }], totalMinutes }
 *
 * This upserts AppControl records for each app — creating new ones if they
 * don't exist, or updating usageToday if they do.
 */
export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { apps, totalMinutes } = body;

        if (!Array.isArray(apps)) {
            return NextResponse.json({ error: 'apps array is required' }, { status: 400 });
        }

        // Verify child exists
        const child = await prisma.child.findUnique({ where: { id } });
        if (!child) {
            return NextResponse.json({ error: 'Child not found' }, { status: 404 });
        }

        // Upsert each app's usage record
        const upsertPromises = apps.map(app => {
            if (!app.packageName || !app.appName) return null;

            return prisma.appControl.upsert({
                where: {
                    // Use a composite unique — but since AppControl doesn't have one,
                    // we find first then create/update
                    id: `placeholder` // Will be handled below
                },
                update: {
                    usageToday: app.usageMinutes || 0,
                    updatedAt: new Date()
                },
                create: {
                    packageName: app.packageName,
                    appName: app.appName,
                    usageToday: app.usageMinutes || 0,
                    isBlocked: false,
                    childId: id
                }
            });
        });

        // Since AppControl doesn't have a composite unique index on (childId, packageName),
        // use findFirst + update/create pattern instead of upsert
        for (const app of apps) {
            if (!app.packageName || !app.appName) continue;

            const existing = await prisma.appControl.findFirst({
                where: {
                    childId: id,
                    packageName: app.packageName
                }
            });

            if (existing) {
                await prisma.appControl.update({
                    where: { id: existing.id },
                    data: {
                        usageToday: app.usageMinutes || 0,
                        appName: app.appName, // Update name in case it changed
                    }
                });
            } else {
                await prisma.appControl.create({
                    data: {
                        packageName: app.packageName,
                        appName: app.appName,
                        usageToday: app.usageMinutes || 0,
                        isBlocked: false,
                        childId: id
                    }
                });
            }
        }

        return NextResponse.json({ success: true, appsUpdated: apps.length });
    } catch (error) {
        console.error('[AppUsage API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * GET /api/children/[id]/app-usage
 * Returns all app usage records for a child.
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const appControls = await prisma.appControl.findMany({
            where: { childId: id },
            orderBy: { usageToday: 'desc' },
            select: {
                id: true,
                packageName: true,
                appName: true,
                usageToday: true,
                isBlocked: true,
                dailyLimit: true,
                iconColor: true,
                updatedAt: true
            }
        });

        return NextResponse.json(appControls);
    } catch (error) {
        console.error('[AppUsage API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
