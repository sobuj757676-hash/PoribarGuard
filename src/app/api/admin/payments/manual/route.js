import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payments = await prisma.manualPayment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                package: { select: { name: true, priceMonthly: true } }
            }
        });
        return NextResponse.json({ payments });
    } catch (error) {
        console.error("Failed to fetch manual payments:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
