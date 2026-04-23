import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkCsrf, rateLimit } from "@/lib/api-utils";

export async function PATCH(request, { params }) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();

        // Handle Subscription Update
        if (body.subscriptionUpdate) {
            const { plan, status, endDate } = body.subscriptionUpdate;

            const subscription = await prisma.subscription.findUnique({
                where: { userId: id }
            });

            if (!subscription) {
                return NextResponse.json({ error: "No subscription found for this user" }, { status: 404 });
            }

            await prisma.subscription.update({
                where: { userId: id },
                data: {
                    plan,
                    status,
                    endDate: new Date(endDate)
                }
            });

            return NextResponse.json({ message: "Subscription updated successfully" });
        }

        // Handle User Status Update
        if (body.isActive !== undefined) {
            const user = await prisma.user.update({
                where: { id },
                data: { isActive: body.isActive },
            });
            return NextResponse.json({ message: "Parent status updated successfully", user });
        }

        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    } catch (error) {
        console.error("Update Parent error:", error);
        return NextResponse.json({ error: "Failed to update parent data" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Parent deleted successfully" });
    } catch (error) {
        console.error("Delete Parent error:", error);
        return NextResponse.json({ error: "Failed to delete parent" }, { status: 500 });
    }
}


export async function GET(request, { params }) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        const parent = await prisma.user.findUnique({
            where: { id },
            include: {
                children: {
                    include: {
                        device: true,
                        alerts: {
                            orderBy: { createdAt: 'desc' },
                            take: 5
                        }
                    }
                },
                subscription: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                supportTickets: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!parent || parent.role !== "PARENT") {
            return NextResponse.json({ error: "Parent not found" }, { status: 404 });
        }

        return NextResponse.json({ parent });
    } catch (error) {
        console.error("Fetch Parent error:", error);
        return NextResponse.json({ error: "Failed to fetch parent details" }, { status: 500 });
    }
}
