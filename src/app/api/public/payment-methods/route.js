import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const configs = await prisma.systemConfig.findMany({
            where: {
                key: { in: ['manual_bkash_number', 'manual_nagad_number'] }
            }
        });

        const mapping = {};
        configs.forEach(c => {
            mapping[c.key] = c.value;
        });

        return NextResponse.json({
            bKash: mapping.manual_bkash_number || "017XXXXXXXX",
            Nagad: mapping.manual_nagad_number || "018XXXXXXXX"
        });
    } catch (error) {
        console.error("Failed to fetch public payment methods:", error);
        return NextResponse.json({ bKash: "017XXXXXXXX", Nagad: "018XXXXXXXX" }); // Fallback on error
    }
}
