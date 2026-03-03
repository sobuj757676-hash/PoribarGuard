const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Initialize the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    // Initialize Socket.IO attached to the HTTP server
    const io = new Server(server, {
        path: "/api/socketio",
        addTrailingSlash: false,
        allowEIO3: true, // Allows Android socket.io-client 2.1.0 (Engine.IO v3) to connect
        cors: {
            origin: "*", // Restrict this in production
            methods: ["GET", "POST"],
        },
    });

    // Keep track of connected devices for basic presence
    // childId -> { socketId, status, lastSeen }
    const onlineDevices = new Map();
    const viewingParents = new Map(); // parentSocketId -> childId

    // --- Phase 2.3: Zombie cleanup interval ---
    // Every 60 seconds, remove child entries that haven't sent a heartbeat in 90 seconds.
    // This handles silent disconnections (network partition, Doze, etc.)
    setInterval(() => {
        const now = Date.now();
        for (const [childId, device] of onlineDevices.entries()) {
            if (device.lastSeen && (now - device.lastSeen > 90000)) {
                console.log(`[Zombie Cleanup] Child ${childId} stale (last seen ${Math.round((now - device.lastSeen) / 1000)}s ago) — removing`);
                onlineDevices.delete(childId);
                // Notify any parent watching this child
                io.to(`child_${childId}`).emit("child_status_update", {
                    childId,
                    status: "offline",
                    reason: "heartbeat_timeout"
                });
            }
        }
    }, 60000);

    io.on("connection", (socket) => {
        console.log(`[Socket] New connection: ${socket.id}`);

        /**
         * PARENT EVENT: join_dashboard
         * Sent when a parent logs into the web dashboard
         */
        socket.on("join_dashboard", ({ parentId }) => {
            console.log(`[Socket] Parent ${parentId} joined dashboard`);
            socket.join(`parent_${parentId}`);
        });

        /**
         * CHILD EVENT: child_connect
         * Sent when the child app comes online (background or foreground)
         */
        socket.on("child_connect", ({ childId }) => {
            onlineDevices.set(childId, {
                socketId: socket.id,
                status: "idle",
                lastSeen: Date.now()
            });
            socket.join(`child_${childId}`);
            console.log(`[Socket] Child ${childId} connected`);

            // Notify parents that this child is now online
            io.to(`child_${childId}`).emit("child_status_update", {
                childId,
                status: "online"
            });
        });

        /**
         * CHILD EVENT: child_heartbeat
         * Sent every 30 seconds by the child app to prove socket liveness.
         * Updates the lastSeen timestamp used by the zombie cleanup.
         */
        socket.on("child_heartbeat", ({ childId, timestamp }) => {
            const device = onlineDevices.get(childId);
            if (device) {
                device.lastSeen = Date.now();
                // Update socketId in case the child reconnected on a new socket
                device.socketId = socket.id;
            } else {
                // Child wasn't in the map (maybe it was zombie-cleaned) — re-add
                onlineDevices.set(childId, {
                    socketId: socket.id,
                    status: "idle",
                    lastSeen: Date.now()
                });
                socket.join(`child_${childId}`);
                console.log(`[Heartbeat] Re-registered child ${childId} after zombie cleanup`);
            }
        });

        // 0. Latency Check (Ping/Pong) before stream
        socket.on("ping_child", ({ childId, timestamp }) => {
            const childNode = onlineDevices.get(childId);
            if (childNode) {
                // Route ping to the child device via their specific socket
                io.to(childNode.socketId).emit("ping_request", { parentSocketId: socket.id, timestamp });
            } else {
                socket.emit("ping_result", { status: "offline" });
            }
        });

        socket.on("pong_parent", ({ parentSocketId, timestamp }) => {
            io.to(parentSocketId).emit("ping_result", { status: "online", childTimestamp: timestamp });
        });

        /**
         * WebRTC SIGNALING EVENTS
         */

        // 1. Parent initiates stream request
        socket.on("start_stream", ({ childId, sdp }) => {
            console.log(`[Socket] Parent requesting stream for Child: ${childId}`);
            viewingParents.set(socket.id, childId);

            const childNode = onlineDevices.get(childId);
            if (childNode) {
                // Forward the WebRTC offer to the specific child phone
                io.to(childNode.socketId).emit("webrtc_signal", {
                    type: "offer",
                    sdp: sdp,
                    parentSocketId: socket.id
                });
            } else {
                socket.emit("webrtc_error", { message: "Child device is offline or sleeping. Sending wakeup ping..." });
            }
        });

        // 1.5. Parent initiates mic stream request
        socket.on("start_mic_stream", ({ childId, sdp }) => {
            console.log(`[Socket] Parent requesting MIC stream for Child: ${childId}`);
            viewingParents.set(socket.id, childId);

            const childNode = onlineDevices.get(childId);
            if (childNode) {
                // Forward the WebRTC offer to the specific child phone
                io.to(childNode.socketId).emit("webrtc_signal", {
                    type: "offer_mic",
                    sdp: sdp,
                    parentSocketId: socket.id
                });
            } else {
                socket.emit("webrtc_error", { message: "Child device is offline or sleeping. Sending wakeup ping..." });
            }
        });

        // 2. Child answers the stream
        socket.on("stream_answer", ({ parentSocketId, sdp }) => {
            io.to(parentSocketId).emit("webrtc_signal", {
                type: "answer",
                sdp: sdp
            });
        });

        // 3. ICE Candidate exchange (bidirectional)
        socket.on("ice_candidate", ({ targetSocketId, childId, candidate }) => {
            if (targetSocketId) {
                // Child -> Parent
                io.to(targetSocketId).emit("webrtc_signal", {
                    type: "ice_candidate",
                    candidate: candidate
                });
            } else if (childId) {
                // Parent -> Child
                const childNode = onlineDevices.get(childId);
                if (childNode) {
                    io.to(childNode.socketId).emit("webrtc_signal", {
                        type: "ice_candidate",
                        candidate: candidate
                    });
                }
            }
        });

        // 4. Remote Control Actions (Parent -> Child)
        socket.on("action", ({ childId, type }) => {
            const childNode = onlineDevices.get(childId);
            if (childNode) {
                // E.g., type: "switch_camera"
                io.to(childNode.socketId).emit("remote_action", { type });
            }
        });

        // 5. Parent stops the stream explicitly
        socket.on("stop_stream", ({ childId }) => {
            viewingParents.delete(socket.id);
            const childNode = onlineDevices.get(childId);
            if (childNode) {
                io.to(childNode.socketId).emit("remote_action", { type: "stop" });
            }
        });

        // 6. Child sends telemetry after session ends
        socket.on("webrtc_telemetry", (data) => {
            console.log(`[Telemetry] Child ${data.childId} session ended. Duration: ${data.durationSeconds}s. Battery dropped: ${data.batteryDropPercent}%`);
        });

        /**
         * SCREEN VIEW EVENTS (Screenshot-based, no WebRTC)
         */

        // 7. Parent requests screen view
        socket.on("start_screen_view", ({ childId }) => {
            console.log(`[Socket] Parent requesting Screen View for Child: ${childId}`);
            viewingParents.set(socket.id, childId);

            const childNode = onlineDevices.get(childId);
            if (childNode) {
                io.to(childNode.socketId).emit("remote_action", { type: "start_screen" });
            } else {
                socket.emit("screen_status", { status: "error", message: "Child device is offline" });
            }
        });

        // 8. Parent stops screen view
        socket.on("stop_screen_view", ({ childId }) => {
            console.log(`[Socket] Parent stopping Screen View for Child: ${childId}`);
            viewingParents.delete(socket.id);

            const childNode = onlineDevices.get(childId);
            if (childNode) {
                io.to(childNode.socketId).emit("remote_action", { type: "stop_screen" });
            }
        });

        // 9. Child sends screen frame → relay to viewing parent
        socket.on("screen_frame", (data) => {
            const { childId, frame } = data;
            // Forward to all parents viewing this child
            for (const [parentSocketId, viewedChildId] of viewingParents.entries()) {
                if (viewedChildId === childId) {
                    io.to(parentSocketId).emit("screen_frame", { frame });
                }
            }
        });

        // 10. Child sends screen status → relay to viewing parent
        socket.on("screen_status", (data) => {
            const { childId, status, message } = data;
            for (const [parentSocketId, viewedChildId] of viewingParents.entries()) {
                if (viewedChildId === childId) {
                    io.to(parentSocketId).emit("screen_status", { status, message });
                }
            }
        });

        /**
         * DISCONNECTION HANDLING
         */
        socket.on("disconnect", () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);

            // Check if it was a child
            for (const [childId, device] of onlineDevices.entries()) {
                if (device.socketId === socket.id) {
                    onlineDevices.delete(childId);
                    console.log(`[Socket] Child ${childId} went offline`);
                    // Notify any parent watching this child
                    io.to(`child_${childId}`).emit("child_status_update", {
                        childId,
                        status: "offline",
                        reason: "socket_disconnect"
                    });
                    break;
                }
            }

            // Check if it was a viewing parent
            if (viewingParents.has(socket.id)) {
                const childId = viewingParents.get(socket.id);
                viewingParents.delete(socket.id);
                // If the parent closed the tab, tell the child to stop the camera
                const childNode = onlineDevices.get(childId);
                if (childNode) {
                    io.to(childNode.socketId).emit("remote_action", { type: "stop" });
                }
            }
        });
    });

    server.once("error", (err) => {
        console.error(err);
        process.exit(1);
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.IO available on path /api/socketio`);
    });
});
