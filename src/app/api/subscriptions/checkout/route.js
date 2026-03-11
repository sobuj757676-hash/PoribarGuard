import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf, sanitize } from "@/lib/api-utils";
import crypto from "crypto";

export async function POST(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;

    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const gateway = sanitize(body.gateway || "");
        const plan = sanitize(body.plan || "PREMIUM");

        if (!gateway || !["bkash", "amarpay"].includes(gateway)) {
            return NextResponse.json({ error: "Invalid payment gateway" }, { status: 400 });
        }

        // Retrieve gateway configuration from SystemConfig
        const configKey = gateway === "bkash" ? "bkash_merchant" : "amarpay_store_id";
        const config = await prisma.systemConfig.findUnique({
            where: { key: configKey }
        });

        if (!config || !config.value.trim()) {
            return NextResponse.json({
                error: `This payment gateway is currently unavailable because the ${gateway} configuration is missing.`
            }, { status: 503 });
        }

        const amount = plan === "PREMIUM" ? 499 : 999; // Mock pricing logic

        // Create pending transaction in database to track the intent
        const transaction = await prisma.transaction.create({
            data: {
                userId: session.user.id,
                gateway: gateway.toUpperCase(),
                amount: amount,
                currency: "BDT",
                status: "PENDING",
                transactionId: `TXN_${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
                metadata: {
                    plan,
                    gatewayConf: config.value // Only for debugging, typically omitted
                }
            }
        });

        // Mock Checkout URL response
        // In reality, this would make a Server-to-Server API call to bKash/AmarPay to generate a payment URL
        const mockCheckoutUrl = `/dashboard?payment=success&txnId=${transaction.transactionId}&gw=${gateway}`;

        return NextResponse.json({
            success: true,
            checkoutUrl: mockCheckoutUrl,
            message: "Redirecting to payment gateway..."
        });

    } catch (e) {
        console.error("Checkout error:", e);
        return NextResponse.json({ error: "Failed to initialize checkout" }, { status: 500 });
    }
}
