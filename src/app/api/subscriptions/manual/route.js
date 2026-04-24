import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf, sanitize } from "@/lib/api-utils";

export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;

    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const method = sanitize(body.method || "");
        const senderDigits = sanitize(body.senderDigits || "");
        const amountStr = sanitize(body.amount || "");
        const packageId = sanitize(body.packageId || "");
        const screenshotUrl = body.screenshotUrl; // Base64 or URL

        if (!method || !["bKash", "Nagad"].includes(method)) {
            return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
        }

        if (!senderDigits || senderDigits.length < 3) {
            return NextResponse.json({ error: "Sender digits must be at least 3 characters" }, { status: 400 });
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        if (!packageId) {
            return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
        }

        if (!screenshotUrl) {
            return NextResponse.json({ error: "Screenshot is required" }, { status: 400 });
        }

        // Validate package
        const selectedPackage = await prisma.subscriptionPackage.findUnique({
            where: { id: packageId }
        });

        if (!selectedPackage || !selectedPackage.isActive) {
            return NextResponse.json({ error: "Invalid or inactive subscription package" }, { status: 400 });
        }

        // Create Manual Payment
        const payment = await prisma.manualPayment.create({
            data: {
                userId: session.user.id,
                packageId,
                method,
                amount,
                senderDigits,
                screenshotUrl,
                status: "PENDING"
            }
        });

        return NextResponse.json({
            success: true,
            message: "Payment submitted successfully. Pending verification.",
            payment
        });

    } catch (e) {
        console.error("Manual payment error:", e);
        return NextResponse.json({ error: "Failed to submit manual payment" }, { status: 500 });
    }
}
