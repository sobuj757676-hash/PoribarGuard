import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
        totalParents,
        totalChildren,
        activeSubscriptions,
        onlineDevices,
        todayAlerts,
        geofenceBreaches,
        totalRevenue,
        openTickets,
        recentTickets,
    ] = await Promise.all([
        prisma.user.count({ where: { role: "PARENT" } }),
        prisma.child.count(),
        prisma.subscription.count({ where: { status: "ACTIVE" } }),
        prisma.device.count({ where: { isOnline: true } }),
        prisma.alert.count({
            where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        }),
        prisma.alert.count({
            where: {
                type: { in: ["GEOFENCE_EXIT", "GEOFENCE_ENTER"] },
                createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
        }),
        prisma.transaction.aggregate({
            where: { status: "SUCCESS" },
            _sum: { amount: true },
        }),
        prisma.supportTicket.count({ where: { status: "OPEN" } }),
        prisma.supportTicket.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, country: true } } },
        }),
    ]);

    return NextResponse.json({
        stats: {
            totalParents,
            totalChildren,
            activeSubscriptions,
            onlineDevices,
            todayAlerts,
            geofenceBreaches,
            totalRevenue: totalRevenue._sum.amount || 0,
            openTickets,
        },
        recentTickets: recentTickets.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            createdAt: t.createdAt,
            userName: t.user.name,
            userCountry: t.user.country,
        })),
    });
}
