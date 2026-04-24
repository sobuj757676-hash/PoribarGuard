import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(request, { params }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { action, rejectionReason } = body;

        const payment = await prisma.manualPayment.findUnique({
            where: { id },
            include: { package: true }
        });

        if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

        if (action === "APPROVE") {
            // Update Payment Status
            await prisma.manualPayment.update({
                where: { id },
                data: { status: "APPROVED" }
            });

            // Update Subscription
            const endDate = new Date();
            // Defaulting to monthly if not specified, typical for these packages based on schema
            endDate.setMonth(endDate.getMonth() + 1);

            await prisma.subscription.upsert({
                where: { userId: payment.userId },
                update: {
                    packageId: payment.packageId,
                    plan: payment.package.name, // Compatibility
                    status: "ACTIVE",
                    amount: payment.amount,
                    endDate: endDate,
                    paymentMethod: payment.method
                },
                create: {
                    userId: payment.userId,
                    packageId: payment.packageId,
                    plan: payment.package.name, // Compatibility
                    status: "ACTIVE",
                    amount: payment.amount,
                    endDate: endDate,
                    paymentMethod: payment.method,
                    billingCycle: "MONTHLY"
                }
            });

            // Also create a Transaction record for billing history consistency
            await prisma.transaction.create({
                data: {
                    userId: payment.userId,
                    trxId: `MANUAL_${id}`,
                    gateway: payment.method.toUpperCase(),
                    amount: payment.amount,
                    status: "SUCCESS"
                }
            });

            return NextResponse.json({ success: true, message: "Payment approved & subscription activated." });

        } else if (action === "REJECT") {
            if (!rejectionReason || rejectionReason.trim() === "") {
                return NextResponse.json({ error: "Rejection reason is required." }, { status: 400 });
            }

            await prisma.manualPayment.update({
                where: { id },
                data: {
                    status: "REJECTED",
                    rejectionReason: rejectionReason.substring(0, 255) // sanitize/limit length
                }
            });

            return NextResponse.json({ success: true, message: "Payment rejected." });
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

    } catch (error) {
        console.error("Failed to update manual payment:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
