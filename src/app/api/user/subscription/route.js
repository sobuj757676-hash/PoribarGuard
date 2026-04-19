import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { checkSubscriptionAccess } from "@/lib/subscription-utils";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    if (!subscription) {
      return NextResponse.json({ active: false, planName: null, features: [] });
    }

    const now = new Date();
    const isExpired = subscription.endDate < now;

    let features = [];
    if (subscription.package && subscription.package.features) {
        try {
            features = JSON.parse(subscription.package.features);
        } catch(e) {}
    } else {
const oldFeatures = {
           PREMIUM: ['app_blocking', 'geofencing', 'prayer_lock', 'location_tracking', 'web_filtering', 'live_camera', 'live_mic', 'live_screen', 'message_sync', 'activity_feed', 'reports'],
           STANDARD: ['app_blocking', 'location_tracking', 'activity_feed']
       };
       features = oldFeatures[subscription.plan] || [];
    }

    const planName = subscription.package ? subscription.package.name : subscription.plan;

    return NextResponse.json({
        active: subscription.status === "ACTIVE" && !isExpired,
        isTrial: subscription.plan === "TRIAL",
        planName,
        endDate: subscription.endDate,
        isExpired,
        features
    });

  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
