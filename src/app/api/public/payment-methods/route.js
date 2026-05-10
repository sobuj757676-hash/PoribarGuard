import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const [methods, configs] = await Promise.all([
            prisma.paymentMethod.findMany({
                where: { status: "Active" },
                orderBy: { priorityOrder: 'asc' }
            }),
            prisma.systemConfig.findMany({
                where: { key: { in: ['payment_online_enabled', 'payment_manual_enabled'] } }
            })
        ]);

        const settings = {
            onlineEnabled: true,
            manualEnabled: true,
        };

        configs.forEach(c => {
            if (c.key === 'payment_online_enabled') settings.onlineEnabled = c.value === 'true';
            if (c.key === 'payment_manual_enabled') settings.manualEnabled = c.value === 'true';
        });

        return NextResponse.json({ methods, settings });
    } catch (error) {
        console.error("Failed to fetch public payment methods:", error);
        return NextResponse.json([]); // Fallback on error
    }
}
