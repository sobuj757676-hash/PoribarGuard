import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const methods = await prisma.paymentMethod.findMany({
            where: {
                status: "Active"
            },
            orderBy: {
                priorityOrder: 'asc'
            }
        });

        return NextResponse.json(methods);
    } catch (error) {
        console.error("Failed to fetch public payment methods:", error);
        return NextResponse.json([]); // Fallback on error
    }
}
