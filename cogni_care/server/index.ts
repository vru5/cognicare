import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { getLogsAction, updateSymptomLogAction } from "./actions/logsActions.js";
import { processBrainDumpAction } from "./actions/processActions.js";
import { transcribeAudioAction } from "./actions/transcribeActions.js";

console.log("Loading environment variables...");
dotenv.config({ path: "../.env" }); // Load from root .env

console.log("Initializing Express app...");
const app = express();
const port = process.env.PORT || 4000;

console.log("Setting up middleware...");
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

console.log("Registering routes...");

// GET /api/logs
app.get("/api/logs", async (req, res) => {
    const { patientId } = req.query;
    if (!patientId || typeof patientId !== "string") {
        return res.status(400).json({ success: false, error: "Missing patientId" });
    }
    const result = await getLogsAction(patientId);
    res.json(result);
});

// PATCH /api/logs
app.patch("/api/logs", async (req, res) => {
    const { logId, newText, patientId } = req.body;
    if (!logId || !newText || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await updateSymptomLogAction(logId, newText, patientId);
    res.json(result);
});

// POST /api/brain-dump/process
app.post("/api/brain-dump/process", async (req, res) => {
    const { rawText, patientId } = req.body;
    if (!rawText || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await processBrainDumpAction(rawText, patientId);
    res.json(result);
});

// POST /api/brain-dump/transcribe
app.post("/api/brain-dump/transcribe", async (req, res) => {
    const { base64Audio } = req.body;
    if (!base64Audio) {
        return res.status(400).json({ success: false, error: "Missing base64Audio" });
    }
    const result = await transcribeAudioAction(base64Audio);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Backend Server running on port ${port}`);
});
