import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const method = await prisma.paymentMethod.findUnique({
            where: { id }
        });

        if (!method) {
            return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
        }

        return NextResponse.json(method);
    } catch (error) {
        console.error("Failed to fetch payment method:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();

        const method = await prisma.paymentMethod.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                logoUrl: data.logoUrl,
                instructions: data.instructions,
                phoneNumber: data.phoneNumber,
                status: data.status,
                priorityOrder: data.priorityOrder,
            }
        });

        return NextResponse.json(method);
    } catch (error) {
        console.error("Failed to update payment method:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.paymentMethod.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete payment method:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
