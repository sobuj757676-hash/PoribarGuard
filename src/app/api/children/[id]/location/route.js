import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/children/[id]/location
 * Called by the Socket.IO server (server.js) to persist location data to the database.
 * Also called directly by the Android app as a fallback when Socket.IO is down.
 * 
 * Body: { latitude, longitude, accuracy, speed, locationName, batteryLevel, networkType }
 */
export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { latitude, longitude, accuracy, speed, locationName, batteryLevel, networkType } = body;

        if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
            return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 });
        }

        // Update the device record with latest location + status
        const device = await prisma.device.findFirst({
            where: { childId: id }
        });

        if (!device) {
            return NextResponse.json({ error: 'Device not found for this child' }, { status: 404 });
        }

        await prisma.device.update({
            where: { id: device.id },
            data: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                locationAccuracy: accuracy ? parseFloat(accuracy) : null,
                speed: speed ? parseFloat(speed) : null,
                locationName: locationName || null,
                batteryLevel: batteryLevel !== undefined ? parseInt(batteryLevel) : device.batteryLevel,
                networkType: networkType || device.networkType,
                isOnline: true,
                lastSeenAt: new Date(),
                locationUpdatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Location API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * GET /api/children/[id]/location
 * Returns the latest location for a child's device.
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const device = await prisma.device.findFirst({
            where: { childId: id },
            select: {
                latitude: true,
                longitude: true,
                locationAccuracy: true,
                speed: true,
                locationName: true,
                batteryLevel: true,
                networkType: true,
                isOnline: true,
                lastSeenAt: true,
                locationUpdatedAt: true
            }
        });

        if (!device) {
            return NextResponse.json({ error: 'Device not found' }, { status: 404 });
        }

        return NextResponse.json(device);
    } catch (error) {
        console.error('[Location API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
