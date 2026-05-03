import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { initSocket } from "./lib/socket.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";
import carerRoutes from "./routes/carerRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import brainDumpRoutes from "./routes/brainDumpRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

console.log("Loading environment variables...");
dotenv.config({ path: "../.env" }); // Load from root .env

console.log("Initializing Express app...");
const app = express();
const port = process.env.PORT || process.env.SERVER_PORT || 4000;

console.log("Setting up middleware...");
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "https://cognicare-rosy.vercel.app",
            "capacitor://localhost",
            "http://localhost",
            "http://localhost:3000",
            "http://localhost:3001"
        ];
        
        const isAllowed = !origin || 
                         allowedOrigins.includes(origin) || 
                         origin.endsWith(".vercel.app");

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Request from blocked origin: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

console.log("Registering routes...");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/carer", carerRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/brain-dump", brainDumpRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/chat", chatRoutes);

const server = app.listen(port, () => {
    console.log(`Backend Server running on port ${port}`);
});

// Initialize Socket.io with the server instance
initSocket(server);
