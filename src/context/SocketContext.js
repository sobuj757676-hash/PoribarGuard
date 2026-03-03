"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!session?.user) return;

        // Connect to the custom Next.js Socket.io server
        const socketInstance = io(window.location.origin, {
            path: "/api/socketio",
            reconnectionAttempts: 5,
        });

        socketInstance.on("connect", () => {
            console.log("[SocketContext] Connected to signaling server with ID:", socketInstance.id);
            // Notify server this is a parent dashboard connection
            socketInstance.emit("join_dashboard", { parentId: session.user.id });
        });

        setSocket(socketInstance);

        return () => {
            if (socketInstance) {
                console.log("[SocketContext] Disconnecting socket...");
                socketInstance.disconnect();
            }
        };
    }, [session]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
