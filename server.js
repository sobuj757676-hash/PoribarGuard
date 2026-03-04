const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";  // Bind to all interfaces (required for phone testing over WiFi)
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
        socket.on("join_dashboard", ({ parentId, childIds }) => {
            console.log(`[Socket] Parent ${parentId} joined dashboard`);
            socket.join(`parent_${parentId}`);

            // Subscribe parent to each of their children's rooms
            // so they receive location_update, child_status_update, and sos_alert
            if (Array.isArray(childIds)) {
                childIds.forEach(childId => {
                    socket.join(`child_${childId}`);
                    console.log(`[Socket] Parent ${parentId} subscribed to child_${childId}`);
                });
            }
        });

        // Allow late subscription (when children load after socket connects)
        socket.on("subscribe_children", ({ childIds }) => {
            if (Array.isArray(childIds)) {
                childIds.forEach(childId => {
                    socket.join(`child_${childId}`);
                });
                console.log(`[Socket] Late-subscribed to ${childIds.length} children`);
            }
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
         * Now includes: batteryLevel, networkType, isScreenOn (Task 9)
         */
        socket.on("child_heartbeat", ({ childId, timestamp, batteryLevel, networkType, isScreenOn }) => {
            const device = onlineDevices.get(childId);
            if (device) {
                device.lastSeen = Date.now();
                device.socketId = socket.id;
                // Store enhanced status data
                device.batteryLevel = batteryLevel;
                device.networkType = networkType;
                device.isScreenOn = isScreenOn;
            } else {
                // Child wasn't in the map (maybe zombie-cleaned) — re-add
                onlineDevices.set(childId, {
                    socketId: socket.id,
                    status: "idle",
                    lastSeen: Date.now(),
                    batteryLevel,
                    networkType,
                    isScreenOn
                });
                socket.join(`child_${childId}`);
                console.log(`[Heartbeat] Re-registered child ${childId} after zombie cleanup`);
            }

            // Broadcast status update to parents (for real-time battery/network display)
            io.to(`child_${childId}`).emit("child_status_update", {
                childId,
                status: "online",
                batteryLevel,
                networkType,
                isScreenOn,
                timestamp
            });

            // Persist battery & network to DB every 5th heartbeat (~2.5 min)
            // to avoid excessive DB writes while keeping data reasonably fresh
            if (!device?._heartbeatCount) {
                if (device) device._heartbeatCount = 0;
            }
            if (device) {
                device._heartbeatCount = (device._heartbeatCount || 0) + 1;
                if (device._heartbeatCount % 5 === 0) {
                    try {
                        fetch(`http://localhost:${port}/api/children/${childId}/location`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                latitude: device.location?.latitude || 0,
                                longitude: device.location?.longitude || 0,
                                batteryLevel,
                                networkType
                            })
                        }).catch(() => { });
                    } catch (e) { }
                }
            }
        });

        /**
         * CHILD EVENT: sos_alert (Task 3)
         * Emergency SOS from child device — relay IMMEDIATELY to all parents
         */
        socket.on("sos_alert", (data) => {
            const { childId, latitude, longitude, timestamp, batteryLevel } = data;
            console.log(`\n🚨🚨🚨 SOS ALERT from child ${childId} at ${latitude},${longitude} 🚨🚨🚨\n`);

            // Relay to ALL parents subscribed to this child
            io.to(`child_${childId}`).emit("sos_alert", {
                childId,
                latitude,
                longitude,
                batteryLevel,
                timestamp
            });

            // Persist SOS alert to database
            try {
                fetch(`http://localhost:${port}/api/alerts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        childId,
                        type: "SOS",
                        title: "🚨 SOS Emergency Alert",
                        description: `Child triggered emergency SOS at ${latitude?.toFixed(4)},${longitude?.toFixed(4)}. Battery: ${batteryLevel}%`,
                        severity: "CRITICAL",
                        metadata: JSON.stringify({ latitude, longitude, batteryLevel, timestamp })
                    })
                }).catch(err => console.error("[SOS] DB persist failed:", err.message));
            } catch (err) {
                console.error("[SOS] DB persist error:", err.message);
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
         * APP USAGE TRACKING (Task 2)
         */

        // 11. Child sends app usage data → store + relay to parents
        socket.on("app_usage_update", (data) => {
            const { childId, apps, totalMinutes, timestamp } = data;
            console.log(`[AppUsage] Child ${childId}: ${apps?.length || 0} apps, total ${totalMinutes} min`);

            // Relay to parents for real-time dashboard update
            io.to(`child_${childId}`).emit("app_usage_update", {
                childId,
                apps,
                totalMinutes,
                timestamp
            });

            // Persist to database (fire-and-forget)
            try {
                fetch(`http://localhost:${port}/api/children/${childId}/app-usage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ apps: JSON.parse(JSON.stringify(apps)), totalMinutes })
                }).catch(err => console.error("[AppUsage] DB persist failed:", err.message));
            } catch (err) {
                console.error("[AppUsage] DB persist error:", err.message);
            }
        });

        /**
         * LOCATION TRACKING EVENTS
         */

        // 11. Child sends location update → store + relay to subscribed parents
        socket.on("location_update", (data) => {
            const { childId, latitude, longitude, accuracy, speed, locationName, batteryLevel, networkType, timestamp } = data;
            console.log(`[Location] Update from child ${childId}: (${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}) acc=${accuracy}m battery=${batteryLevel}%`);

            // Update in-memory device state
            const device = onlineDevices.get(childId);
            if (device) {
                device.location = { latitude, longitude, accuracy, speed, locationName, batteryLevel, networkType, timestamp };
                device.lastSeen = Date.now();
            }

            // Broadcast to all parents subscribed to this child
            io.to(`child_${childId}`).emit("location_update", {
                childId,
                latitude,
                longitude,
                accuracy,
                speed,
                locationName,
                batteryLevel,
                networkType,
                timestamp
            });

            // Persist to database via internal API (fire-and-forget)
            try {
                const url = `http://localhost:${port}/api/children/${childId}/location`;
                fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ latitude, longitude, accuracy, speed, locationName, batteryLevel, networkType })
                }).catch(err => console.error("[Location] DB persist failed:", err.message));
            } catch (err) {
                console.error("[Location] DB persist error:", err.message);
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
