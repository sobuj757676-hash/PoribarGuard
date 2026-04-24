import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const manualPayment = await prisma.manualPayment.findFirst({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: 'desc' },
      include: { package: true }
    });

    return NextResponse.json({ pending: manualPayment });

  } catch (error) {
    console.error("Error fetching manual payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch manual payment status" },
      { status: 500 }
    );
  }
}
