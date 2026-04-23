import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server | null = null;

export function initSocket(server: HttpServer) {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST", "PATCH"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        socket.on("join", (profileId: string) => {
            if (profileId) {
                socket.join(profileId);
                console.log(`[Socket] Client ${socket.id} joined personal room: ${profileId}`);
            }
        });

        socket.on("join_room", (roomId: string) => {
            if (roomId) {
                socket.join(roomId);
                console.log(`[Socket] Client ${socket.id} joined chat room: ${roomId}`);
            }
        });

        socket.on("leave_room", (roomId: string) => {
            if (roomId) {
                socket.leave(roomId);
                console.log(`[Socket] Client ${socket.id} left room: ${roomId}`);
            }
        });

        socket.on("disconnect", () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}
