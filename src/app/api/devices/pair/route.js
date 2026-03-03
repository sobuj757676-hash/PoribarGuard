import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const body = await request.json();
        const { pairingCode, deviceId, model, osVersion } = body;

        if (!pairingCode || !deviceId) {
            return NextResponse.json({ error: "Missing pairingCode or deviceId" }, { status: 400 });
        }

        const child = await prisma.child.findUnique({
            where: { pairingCode }
        });

        if (!child) {
            return NextResponse.json({ error: "Invalid pairing code" }, { status: 404 });
        }

        if (child.pairingExpiresAt && new Date() > new Date(child.pairingExpiresAt)) {
            return NextResponse.json({ error: "Pairing code has expired" }, { status: 400 });
        }

        if (child.isPaired) {
            return NextResponse.json({ error: "This code has already been used" }, { status: 400 });
        }

        // Generate a secure, long-lived token for the device
        const deviceToken = crypto.randomBytes(32).toString('hex');

        // Check if this physical device (hardware ID) is already linked to ANOTHER child profile
        // This happens if the app is reinstalled and the parent creates a duplicate "Add Child" profile.
        const existingDevice = await prisma.device.findUnique({
            where: { deviceId }
        });

        if (existingDevice && existingDevice.childId !== child.id) {
            // Delete the old ghost device connection so the hardware ID is freed up
            console.log(`[Pairing] Cleaning up old device connection for Hardware ID: ${deviceId}`);
            await prisma.device.delete({
                where: { id: existingDevice.id }
            });
        }

        // Update the child as paired, and upsert the device
        await prisma.$transaction([
            prisma.child.update({
                where: { id: child.id },
                data: {
                    isPaired: true,
                    pairingCode: null, // invalidate the code
                }
            }),
            prisma.device.upsert({
                where: { childId: child.id },
                create: {
                    childId: child.id,
                    deviceId,
                    deviceToken,
                    model: model || 'Unknown Android',
                    osVersion: osVersion || 'Unknown OS',
                    isOnline: true
                },
                update: {
                    deviceId,
                    deviceToken,
                    model: model || 'Unknown Android',
                    osVersion: osVersion || 'Unknown OS',
                    isOnline: true,
                    lastSeenAt: new Date()
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            childId: child.id,
            deviceToken
        });

    } catch (error) {
        console.error("Pairing Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
