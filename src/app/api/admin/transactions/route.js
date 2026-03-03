import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const gateway = searchParams.get("gateway") || "";

    const where = {};
    if (gateway) {
        where.gateway = gateway;
    }

    const [transactions, total, gatewayStats] = await Promise.all([
        prisma.transaction.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } },
        }),
        prisma.transaction.count({ where }),
        prisma.$queryRaw`
      SELECT gateway, 
             COUNT(*)::int as count,
             COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END), 0) as revenue
      FROM "Transaction"
      GROUP BY gateway
    `,
    ]);

    return NextResponse.json({
        transactions: transactions.map((t) => ({
            id: t.id,
            trxId: t.trxId,
            gateway: t.gateway,
            amount: t.amount,
            status: t.status,
            createdAt: t.createdAt,
            parentName: t.user.name,
            parentEmail: t.user.email,
        })),
        gatewayStats: gatewayStats.map((g) => ({
            gateway: g.gateway,
            count: Number(g.count),
            revenue: Number(g.revenue),
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}
