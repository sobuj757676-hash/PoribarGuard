import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// In-memory store (shared with server.js via global)
// server.js will also read/write to this map
if (!global.setupSessions) {
    global.setupSessions = new Map();
}

/**
 * POST /api/setup-sessions
 * Called by the Wizard APK when it first launches.
 * Registers the device info and creates a setup session.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { pairingCode, device } = body;

        if (!pairingCode) {
            return NextResponse.json({ error: "Missing pairingCode" }, { status: 400 });
        }

        // Look up the child by pairing code to find the parent
        const child = await prisma.child.findUnique({
            where: { pairingCode },
            select: { id: true, parentId: true, name: true }
        });

        if (!child) {
            return NextResponse.json({ error: "Invalid pairing code" }, { status: 404 });
        }

        // Generate session credentials
        const sessionId = `sess_${crypto.randomBytes(8).toString('hex')}`;
        const socketToken = `tok_${crypto.randomBytes(16).toString('hex')}`;

        // Create the session object
        const session = {
            sessionId,
            socketToken,
            pairingCode,
            parentId: child.parentId,
            childId: child.id,
            childName: child.name,
            device: device || {},
            currentStep: 'WIZARD_LAUNCHED',
            stepStatus: 'DONE',
            steps: [
                { id: 'WIZARD_LAUNCHED', status: 'DONE', at: new Date().toISOString() }
            ],
            createdAt: new Date().toISOString(),
            wizardSocketId: null
        };

        // Store in global map (accessible by server.js Socket.IO handlers)
        global.setupSessions.set(sessionId, session);

        // Also index by pairingCode for GET lookups
        global.setupSessions.set(`code_${pairingCode}`, sessionId);

        // If the Socket.IO server is available, notify the parent immediately  
        if (global.io) {
            global.io.to(`parent_${child.parentId}`).emit('setup_session_started', {
                sessionId,
                device: session.device,
                pairingCode,
                childName: child.name
            });
        }

        return NextResponse.json({
            sessionId,
            socketToken,
            serverSocketUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            socketPath: '/api/socketio'
        });

    } catch (error) {
        console.error("[SetupSessions] POST Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * GET /api/setup-sessions?code=658601
 * Called by the Parent Dashboard to fetch current setup state (fallback/reload).
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "Missing 'code' query parameter" }, { status: 400 });
        }

        // Look up session by pairing code
        const sessionId = global.setupSessions?.get(`code_${code}`);
        if (!sessionId) {
            return NextResponse.json({ error: "No active setup session for this code" }, { status: 404 });
        }

        const session = global.setupSessions.get(sessionId);
        if (!session) {
            return NextResponse.json({ error: "Session expired" }, { status: 404 });
        }

        return NextResponse.json({
            sessionId: session.sessionId,
            device: session.device,
            childName: session.childName,
            currentStep: session.currentStep,
            stepStatus: session.stepStatus,
            steps: session.steps,
            createdAt: session.createdAt
        });

    } catch (error) {
        console.error("[SetupSessions] GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
