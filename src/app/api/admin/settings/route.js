import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, sanitize, checkCsrf } from "@/lib/api-utils";

// Default system config values
const DEFAULTS = {
    trial_days: "7",
    bkash_merchant: "",
    amarpay_store_id: "",
    ssl_sms_api_key: "",
    sendgrid_api_key: "",
    fcm_server_key: "",
    maintenance_mode: "false",
};

// GET — Read all system settings (admin only)
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configs = await prisma.systemConfig.findMany();
    const settings = { ...DEFAULTS };

    configs.forEach((c) => {
        settings[c.key] = c.value;
    });

    return NextResponse.json({ settings });
}

// PUT — Update system settings (admin only)
export async function PUT(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates = [];

    for (const [key, value] of Object.entries(body)) {
        if (key in DEFAULTS) {
            updates.push(
                prisma.systemConfig.upsert({
                    where: { key },
                    update: { value: sanitize(String(value), 500) },
                    create: { key, value: sanitize(String(value), 500) },
                })
            );
        }
    }

    if (updates.length === 0) {
        return NextResponse.json({ error: "No valid settings to update" }, { status: 400 });
    }

    await Promise.all(updates);

    return NextResponse.json({ message: `${updates.length} setting(s) updated` });
}
