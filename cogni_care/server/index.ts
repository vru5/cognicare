import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { prisma } from "./lib/prisma.js";
import { getLogsAction, updateSymptomLogAction, createManualLogAction, addCarerCommentAction, deleteCarerNoteAction, deleteSymptomLogAction } from "./actions/logs/logsActions.js";
import { processBrainDumpAction } from "./actions/brain-dump/processActions.js";
import { transcribeAudioAction } from "./actions/brain-dump/transcribeActions.js";
import { registerUser, getProfileAction, loginUser } from "./actions/auth/authActions.js";
import { getCarerPatientsAction, markPatientAsViewedAction } from "./actions/carer/carerActions.js";
import { getPatientCarersAction, updateCarerAccessAction, getFullProfileAction } from "./actions/settings/patientSettingActions.js";
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
    const { patientId, requesterId, isCarer } = req.query;
    if (!patientId || typeof patientId !== "string") {
        return res.status(400).json({ success: false, error: "Missing patientId" });
    }
    const result = await getLogsAction(
        patientId, 
        requesterId as string, 
        isCarer === "true"
    );
    res.json(result);
});

// POST /api/logs
app.post("/api/logs", async (req, res) => {
    const { patientId, rawText, isFromCarer, carerId } = req.body;
    if (!patientId || !rawText) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await createManualLogAction({ patientId, rawText, isFromCarer, carerId });
    res.json(result);
});

// PATCH /api/logs
app.patch("/api/logs", async (req, res) => {
    const { logId, newText, patientId, isFromCarer, carerId } = req.body;
    if (!logId || !patientId || !newText) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await updateSymptomLogAction(logId, { newText, patientId, isFromCarer, carerId });
    res.json(result);
});

// DELETE /api/logs
app.delete("/api/logs", async (req, res) => {
    const { logId, patientId, isFromCarer } = req.body;
    if (!logId || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await deleteSymptomLogAction(logId, patientId, isFromCarer === true || isFromCarer === "true");
    res.json(result);
});

// POST /api/logs/comment
app.post("/api/logs/comment", async (req, res) => {
    const { logId, text, carerId } = req.body;
    if (!logId || !text || !carerId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await addCarerCommentAction(logId, { text, carerId });
    res.json(result);
});

// DELETE /api/logs/carer-note
app.delete("/api/logs/carer-note", async (req, res) => {
    const { noteId, carerId, patientId, isFromCarer } = req.body;
    if (!noteId || !carerId || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await deleteCarerNoteAction(noteId, carerId, patientId, isFromCarer === true || isFromCarer === "true");
    res.json(result);
});

// DELETE /api/logs/comment (legacy but redirecting to note)
app.delete("/api/logs/comment", async (req, res) => {
    const { commentId, carerId, patientId, isFromCarer } = req.body;
    if (!commentId || !carerId || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await deleteCarerNoteAction(commentId, carerId, patientId, isFromCarer === true || isFromCarer === "true");
    res.json(result);
});
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

// GET /api/settings/profile
app.get("/api/settings/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ success: false, error: "Missing userId" });
    }
    const result = await getFullProfileAction(userId);
    res.json(result);
});

// GET /api/settings/carers
app.get("/api/settings/carers", async (req, res) => {
    const { patientProfileId } = req.query;
    if (!patientProfileId || typeof patientProfileId !== "string") {
        return res.status(400).json({ success: false, error: "Missing patientProfileId" });
    }
    const result = await getPatientCarersAction(patientProfileId);
    res.json(result);
});

// PATCH /api/settings/carers
app.patch("/api/settings/carers", async (req, res) => {
    const { patientProfileId, carerProfileId, data } = req.body;
    if (!patientProfileId || !carerProfileId || !data) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await updateCarerAccessAction(patientProfileId, carerProfileId, data);
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

// POST /api/auth/push-token
app.post("/api/auth/push-token", async (req, res) => {
    const { userId, pushToken } = req.body;
    if (!userId || !pushToken) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    try {
        // Try to update patient profile first
        const patientResult = await prisma.profilePatient.updateMany({
            where: { userId },
            data: { pushToken },
        });

        if (patientResult.count > 0) {
            return res.json({ success: true, message: "Patient push token updated" });
        }

        // If no patient profile found, try carer profile
        const carerResult = await prisma.profileCarer.updateMany({
            where: { userId },
            data: { pushToken },
        });

        if (carerResult.count > 0) {
            return res.json({ success: true, message: "Carer push token updated" });
        }

        res.status(404).json({ success: false, error: "User profile not found" });
    } catch (error) {
        console.error("Failed to register push token:", error);
        res.status(500).json({ success: false, error: "Failed to register push token" });
    }
});

app.listen(port, () => {
    console.log(`Backend Server running on port ${port}`);
});
