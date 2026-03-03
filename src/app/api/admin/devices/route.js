import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/api-utils";

// GET — List all devices (admin only)
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const devices = await prisma.device.findMany({
        orderBy: { lastSeenAt: "desc" },
        include: {
            child: {
                select: {
                    id: true,
                    name: true,
                    age: true,
                    parent: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
        },
    });

    return NextResponse.json({
        devices: devices.map((d) => ({
            id: d.id,
            deviceId: d.deviceId,
            model: d.model,
            osVersion: d.osVersion,
            batteryLevel: d.batteryLevel,
            networkType: d.networkType,
            isOnline: d.isOnline,
            lastSeenAt: d.lastSeenAt,
            latitude: d.latitude,
            longitude: d.longitude,
            locationName: d.locationName,
            childName: d.child?.name,
            childAge: d.child?.age,
            parentName: d.child?.parent?.name,
            parentEmail: d.child?.parent?.email,
        })),
        total: devices.length,
    });
}
