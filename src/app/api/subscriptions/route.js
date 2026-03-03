import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/api-utils";

// GET — Get current parent's subscription
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
    });

    if (!subscription) {
        return NextResponse.json({ subscription: null, message: "No active subscription" });
    }

    return NextResponse.json({ subscription });
}
