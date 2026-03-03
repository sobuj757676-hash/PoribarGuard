import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/api-utils";

// GET — Analytics data for admin dashboard
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Registration per day (last 7 days)
    const recentUsers = await prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, role: "PARENT" },
        select: { createdAt: true },
    });

    const regByDay = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        regByDay[key] = 0;
    }
    recentUsers.forEach(u => {
        const key = u.createdAt.toISOString().slice(0, 10);
        if (regByDay[key] !== undefined) regByDay[key]++;
    });

    // Subscription plan distribution
    const subscriptions = await prisma.subscription.groupBy({
        by: ["plan"],
        _count: { plan: true },
    });
    const planDist = {};
    subscriptions.forEach(s => { planDist[s.plan] = s._count.plan; });

    // Alert type distribution (last 30 days)
    const alerts = await prisma.alert.groupBy({
        by: ["type"],
        _count: { type: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const alertDist = {};
    alerts.forEach(a => { alertDist[a.type] = a._count.type; });

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const transactions = await prisma.transaction.findMany({
        where: { createdAt: { gte: sixMonthsAgo }, status: "COMPLETED" },
        select: { amount: true, createdAt: true },
    });
    const revenueByMonth = {};
    transactions.forEach(t => {
        const key = t.createdAt.toISOString().slice(0, 7); // YYYY-MM
        revenueByMonth[key] = (revenueByMonth[key] || 0) + t.amount;
    });

    // Top countries
    const countries = await prisma.user.groupBy({
        by: ["country"],
        _count: { country: true },
        where: { role: "PARENT", country: { not: null } },
        orderBy: { _count: { country: "desc" } },
        take: 5,
    });

    return NextResponse.json({
        registrationsByDay: regByDay,
        planDistribution: planDist,
        alertDistribution: alertDist,
        revenueByMonth,
        topCountries: countries.map(c => ({ country: c.country, count: c._count.country })),
    });
}
