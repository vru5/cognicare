import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/constants/auth";

let socket: Socket | null = null;

export const getSocket = (profileId?: string) => {
    if (!socket) {
        socket = io(API_BASE_URL, {
            transports: ["websocket"],
        });

        socket.on("connect", () => {
            console.log("[Socket] Connected to backend:", socket?.id);
            if (profileId) {
                socket?.emit("join", profileId);
            }
        });

        socket.on("disconnect", () => {
            console.log("[Socket] Disconnected");
        });
    }

    if (profileId && socket.connected) {
        socket.emit("join", profileId);
    }

    return socket;
};
