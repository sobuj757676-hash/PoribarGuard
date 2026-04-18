import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, sanitize, checkCsrf } from "@/lib/api-utils";

// Reads trial days from SystemConfig (admin-configurable), defaults to 7
async function getTrialDays() {
    try {
        const config = await prisma.systemConfig.findUnique({ where: { key: "trial_days" } });
        return config ? parseInt(config.value) || 7 : 7;
    } catch { return 7; }
}

export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    // Rate limit
    const rateLimited = rateLimit(request);
    if (rateLimited) return rateLimited;

    try {
        const body = await request.json();
        const name = sanitize(body.name, 100);
        const email = sanitize(body.email, 200);
        const password = body.password;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (existing) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password and create user + trial subscription in a transaction
        const passwordHash = await hash(password, 12);
        const trialDays = await getTrialDays();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + trialDays);

        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email: email.toLowerCase().trim(),
                    passwordHash,
                    role: "PARENT",
                },
            });

            // Auto-create 7-day trial subscription
            await tx.subscription.create({
                data: {
                    userId: newUser.id,
                    plan: "TRIAL",
                    status: "ACTIVE",
                    billingCycle: "MONTHLY",
                    amount: 0,
                    startDate: new Date(),
                    endDate: trialEndDate,
                    autoRenew: false,
                    paymentMethod: null,
                },
            });

            return newUser;
        });

        return NextResponse.json(
            { message: "Account created successfully", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
