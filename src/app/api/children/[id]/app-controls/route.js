import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

// PUT — Toggle app block/unblock
export async function PUT(request, { params }) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;

    const rl = rateLimit(request); if (rl) return rl;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: childId } = await params;
    const { appControlId, isBlocked } = await request.json();

    if (!appControlId || isBlocked === undefined) {
        return NextResponse.json(
            { error: "appControlId and isBlocked are required" },
            { status: 400 }
        );
    }

    // Verify child belongs to parent
    const child = await prisma.child.findFirst({
        where: { id: childId, parentId: session.user.id },
    });

    if (!child) {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Verify app control belongs to this child
    const appControl = await prisma.appControl.findFirst({
        where: { id: appControlId, childId },
    });

    if (!appControl) {
        return NextResponse.json({ error: "App control not found" }, { status: 404 });
    }

    const updated = await prisma.appControl.update({
        where: { id: appControlId },
        data: { isBlocked: Boolean(isBlocked) },
    });

    return NextResponse.json(updated);
}
