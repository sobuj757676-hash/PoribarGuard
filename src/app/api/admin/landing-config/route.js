import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// All allowed landing page config keys
const ALLOWED_SECTIONS = [
    "landing_hero",
    "landing_features",
    "landing_pricing",
    "landing_faq",
    "landing_testimonials",
    "landing_howitworks",
    "landing_painpromise",
    "landing_cta",
    "landing_footer",
];

// GET — Read all landing page configs (admin only)
export async function GET(request) {
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configs = await prisma.systemConfig.findMany({
        where: {
            key: { in: ALLOWED_SECTIONS },
        },
    });

    const landingConfig = {};
    configs.forEach((c) => {
        try {
            landingConfig[c.key] = JSON.parse(c.value);
        } catch {
            landingConfig[c.key] = c.value;
        }
    });

    return NextResponse.json({ landingConfig });
}

// PUT — Update a specific landing page section (admin only)
export async function PUT(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { section, data } = body;

    if (!section || !ALLOWED_SECTIONS.includes(section)) {
        return NextResponse.json(
            { error: `Invalid section. Allowed: ${ALLOWED_SECTIONS.join(", ")}` },
            { status: 400 }
        );
    }

    if (data === undefined || data === null) {
        return NextResponse.json({ error: "Data is required" }, { status: 400 });
    }

    const jsonValue = JSON.stringify(data);

    // Limit to 50KB per section to prevent abuse
    if (jsonValue.length > 50000) {
        return NextResponse.json({ error: "Data too large (max 50KB)" }, { status: 400 });
    }

    await prisma.systemConfig.upsert({
        where: { key: section },
        update: { value: jsonValue },
        create: { key: section, value: jsonValue },
    });

    return NextResponse.json({ message: `${section} updated successfully` });
}
