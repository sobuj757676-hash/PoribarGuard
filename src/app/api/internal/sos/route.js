import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import NotificationService from "@/lib/notification-service";

export async function POST(request) {
    try {
        // In a real app, verify a secret header so only server.js can call this
        const { childId, latitude, longitude, batteryLevel, timestamp } = await request.json();

        if (!childId) {
            return NextResponse.json({ error: "Missing childId" }, { status: 400 });
        }

        const child = await prisma.child.findUnique({
            where: { id: childId },
            include: { parent: true }
        });

        if (!child) {
            return NextResponse.json({ error: "Child not found" }, { status: 404 });
        }

        // 1. Persist the Alert
        const alert = await prisma.alert.create({
            data: {
                type: "SOS",
                title: "🚨 SOS Emergency Alert",
                description: `Emergency SOS triggered at ${latitude?.toFixed(4)},${longitude?.toFixed(4)}. Battery: ${batteryLevel}%`,
                severity: "CRITICAL",
                childId,
                metadata: JSON.stringify({ latitude, longitude, batteryLevel, timestamp })
            }
        });

        // 2. Dispatch Notifications
        const parentEmail = child.parent?.email;
        const parentPhone = child.parent?.phone;
        const parentName = child.parent?.name || "Parent";

        const locationLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        // Send Email
        if (parentEmail) {
            const html = `
                <h2>🚨 SOS Emergency Alert: ${child.name}</h2>
                <p><strong>${child.name}</strong> has just triggered an SOS alert.</p>
                <ul>
                    <li><strong>Location:</strong> <a href="${locationLink}">View on Google Maps</a></li>
                    <li><strong>Battery:</strong> ${batteryLevel}%</li>
                    <li><strong>Time:</strong> ${new Date(timestamp || Date.now()).toLocaleString()}</li>
                </ul>
                <p>Please check your PoribarGuard dashboard immediately.</p>
            `;
            await NotificationService.sendEmail(parentEmail, `🚨 EMERGENCY: SOS Alert from ${child.name}`, html);
        }

        // Send SMS
        if (parentPhone) {
            const smsText = `🚨 PoribarGuard EMERGENCY: SOS Alert triggered by ${child.name}. Location: ${locationLink} Battery: ${batteryLevel}%. Check dashboard immediately!`;
            await NotificationService.sendSMS(parentPhone, smsText);
        }

        // Optional: FCM Push if setup in future
        // NotificationService.sendPushMessage(parent.fcmToken, ...)

        return NextResponse.json({ success: true, alertId: alert.id }, { status: 201 });
    } catch (e) {
        console.error("[Internal SOS API] Error:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
