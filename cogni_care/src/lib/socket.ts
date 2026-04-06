import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/constants/auth";

let socket: Socket | null = null;
let currentProfileId: string | null = null;

export const getSocket = (profileId?: string) => {
    if (profileId) {
        currentProfileId = profileId;
    }

    if (!socket) {
        console.log("[Socket] Initializing new socket connection...");
        socket = io(API_BASE_URL, {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            console.log("[Socket] Connected to backend:", socket?.id);
            if (currentProfileId) {
                console.log(`[Socket] Joining personal room: ${currentProfileId}`);
                socket?.emit("join", currentProfileId);
            }
        });

        socket.on("connect_error", (error) => {
            console.error("[Socket] Connection error:", error);
        });

        socket.on("disconnect", (reason) => {
            console.log("[Socket] Disconnected:", reason);
        });
    }

    // If profileId was provided and we are already connected, join immediately
    if (profileId && socket.connected) {
        console.log(`[Socket] Re-joining/Updating personal room: ${profileId}`);
        socket.emit("join", profileId);
    }

    return socket;
};
