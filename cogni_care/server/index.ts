import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { getLogsAction, updateSymptomLogAction, createManualLogAction } from "./actions/logs/logsActions.js";
import { processBrainDumpAction } from "./actions/brain-dump/processActions.js";
import { transcribeAudioAction } from "./actions/brain-dump/transcribeActions.js";
import { registerUser, getProfileAction, loginUser } from "./actions/auth/authActions.js";
import { getCarerPatientsAction, markPatientAsViewedAction } from "./actions/carer/carerActions.js";
import { AppError } from "./types/logsApi.js";

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

// POST /api/logs
app.post("/api/logs", async (req, res) => {
    const { patientId, rawText, isFromCarer } = req.body;
    if (!patientId || !rawText) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await createManualLogAction({ patientId, rawText, isFromCarer });
    res.json(result);
});

// PATCH /api/logs
app.patch("/api/logs", async (req, res) => {
    const { logId, newText, patientId, carerComment } = req.body;
    if (!logId || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await updateSymptomLogAction(logId, { newText, patientId, carerComment });
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


// GET /api/auth/profile
app.get("/api/auth/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ success: false, error: "Missing userId" });
    }
    const result = await getProfileAction(userId);
    res.json(result);
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
    try {
        const result = await loginUser(req.body);
        res.json(result);
    } catch (error: unknown) {
        const err = error as AppError;
        console.error("Login error:", error);
        res.status(401).json({ success: false, error: err.message });
    }
});

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (error: unknown) {
        const err = error as AppError;
        console.error("Registration error:", error);
        res.status(err.message === "Missing required fields" ? 400 : 500).json({ error: err.message });
    }
});

// GET /api/carer/patients
app.get("/api/carer/patients", async (req, res) => {
    const { carerProfileId } = req.query;
    if (!carerProfileId || typeof carerProfileId !== "string") {
        return res.status(400).json({ success: false, error: "Missing carerProfileId" });
    }
    const result = await getCarerPatientsAction(carerProfileId);
    res.json(result);
});

// POST /api/carer/mark-viewed
app.post("/api/carer/mark-viewed", async (req, res) => {
    const { carerProfileId, patientId } = req.body;
    if (!carerProfileId || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await markPatientAsViewedAction(carerProfileId, patientId);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Backend Server running on port ${port}`);
});
