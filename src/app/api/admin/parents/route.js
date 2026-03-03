import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, sanitize, checkCsrf } from "@/lib/api-utils";
import { hash } from "bcryptjs";

export async function GET(request) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const search = searchParams.get("search") || "";
    const country = searchParams.get("country") || "";
    const plan = searchParams.get("plan") || "";

    const where = { role: "PARENT" };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ];
    }

    if (country) {
        where.country = country;
    }

    if (plan) {
        where.subscription = { plan };
    }

    const [parents, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                country: true,
                city: true,
                isActive: true,
                createdAt: true,
                children: {
                    select: {
                        id: true,
                        name: true,
                        age: true,
                        phone: true,
                        device: { select: { isOnline: true } },
                    },
                },
                subscription: {
                    select: {
                        plan: true,
                        status: true,
                        billingCycle: true,
                        endDate: true,
                    },
                },
            },
        }),
        prisma.user.count({ where }),
    ]);

    return NextResponse.json({
        parents: parents.map((p) => ({
            ...p,
            children: p.children.map((c) => ({
                ...c,
                isOnline: c.device?.isOnline || false,
            })),
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const name = sanitize(body.name, 100);
        const email = sanitize(body.email, 200);
        const password = body.password;
        const phone = sanitize(body.phone, 20);
        const country = sanitize(body.country, 50);
        const city = sanitize(body.city, 100);
        const plan = sanitize(body.plan, 50) || "TRIAL";

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (existing) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
        }

        const passwordHash = await hash(password, 12);

        let trialDays = 7;
        const config = await prisma.systemConfig.findUnique({ where: { key: "trial_days" } });
        if (config && config.value) {
            trialDays = parseInt(config.value, 10) || 7;
        }

        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + trialDays);

        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email: email.toLowerCase().trim(),
                    passwordHash,
                    phone,
                    country,
                    city,
                    role: "PARENT",
                }
            });

            await tx.subscription.create({
                data: {
                    userId: newUser.id,
                    plan: plan,
                    status: "ACTIVE",
                    startDate: new Date(),
                    endDate: plan === "TRIAL" ? trialEndDate : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    amount: 0,
                }
            });

            return newUser;
        });

        return NextResponse.json({ message: "Parent created successfully", user }, { status: 201 });
    } catch (error) {
        console.error("Add Parent error:", error);
        return NextResponse.json({ error: "Failed to create parent account" }, { status: 500 });
    }
}
