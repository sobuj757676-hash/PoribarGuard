import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const methods = await prisma.paymentMethod.findMany({
            orderBy: {
                priorityOrder: 'asc'
            }
        });

        return NextResponse.json(methods);
    } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Basic validation
        if (!data.name || !data.type) {
            return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
        }

        const method = await prisma.paymentMethod.create({
            data: {
                name: data.name,
                type: data.type,
                logoUrl: data.logoUrl,
                instructions: data.instructions,
                phoneNumber: data.phoneNumber,
                status: data.status || "Active",
                priorityOrder: data.priorityOrder || 0,
            }
        });

        return NextResponse.json(method);
    } catch (error) {
        console.error("Failed to create payment method:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
