import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { rateLimit, checkCsrf } from "@/lib/api-utils";

export async function PUT(request) {
    const csrfError = checkCsrf(request); if (csrfError) return csrfError;
    const rl = rateLimit(request); if (rl) return rl;

    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Both current and new password are required" }, { status: 400 });
    }
    if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
    if (!user?.passwordHash) {
        return NextResponse.json({ error: "Password change not available for social login accounts" }, { status: 400 });
    }

    const isValid = await compare(currentPassword, user.passwordHash);
    if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    const newHash = await hash(newPassword, 12);
    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: newHash } });

    return NextResponse.json({ message: "Password updated successfully" });
}
