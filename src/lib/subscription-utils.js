import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkSubscriptionAccess(userId, requiredFeature = null) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    if (!subscription) {
      return {
        hasAccess: false,
        reason: "NO_SUBSCRIPTION",
        message: "You do not have an active subscription."
      };
    }

    const now = new Date();
    const isExpired = subscription.endDate < now;

    if (isExpired) {
      const isTrial = subscription.plan === "TRIAL";
      return {
        hasAccess: false,
        reason: isTrial ? "TRIAL_EXPIRED" : "SUBSCRIPTION_EXPIRED",
        message: isTrial
          ? "Your free trial has ended. Please upgrade to a premium plan to continue."
          : "Your subscription has expired. Please renew your plan."
      };
    }

    if (subscription.status !== "ACTIVE") {
        return {
            hasAccess: false,
            reason: "SUBSCRIPTION_NOT_ACTIVE",
            message: "Your subscription is not currently active."
        }
    }

    // If a specific feature is required, check if it's included in the package
    if (requiredFeature && subscription.package && subscription.package.features) {
      try {
        const features = JSON.parse(subscription.package.features);
        if (!features.includes(requiredFeature)) {
          return {
            hasAccess: false,
            reason: "FEATURE_NOT_INCLUDED",
            message: `The ${requiredFeature.replace('_', ' ')} feature is not included in your current plan.`
          };
        }
      } catch (e) {
        // If features JSON is invalid, default to deny
        return {
          hasAccess: false,
          reason: "INVALID_PACKAGE_FEATURES",
          message: "Could not verify feature access."
        };
      }
    } else if (requiredFeature && !subscription.package) {
      // Legacy plans (STANDARD, PREMIUM) don't have explicit packages, assuming access for backward compat or handle accordingly
      // Or you can map old plans to features here. For simplicity, we assume they have access to old features, or we could strict deny.
      // Let's assume old PREMIUM had everything, STANDARD had some.
       const oldFeatures = {
           PREMIUM: ['app_blocking', 'geofencing', 'prayer_lock', 'location_tracking', 'web_filtering'],
           STANDARD: ['app_blocking', 'location_tracking']
       };
       const features = oldFeatures[subscription.plan] || [];
       if (!features.includes(requiredFeature)) {
           return {
            hasAccess: false,
            reason: "FEATURE_NOT_INCLUDED",
            message: `The ${requiredFeature.replace('_', ' ')} feature is not included in your current plan.`
          };
       }
    }

    return { hasAccess: true };
  } catch (error) {
    console.error("Error checking subscription access:", error);
    return { hasAccess: false, reason: "ERROR", message: "An error occurred while verifying access." };
  }
}
