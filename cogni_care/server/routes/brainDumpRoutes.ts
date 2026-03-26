import express from "express";
import { processBrainDumpAction } from "../actions/brain-dump/processActions.js";
import { transcribeAudioAction } from "../actions/brain-dump/transcribeActions.js";
import { updateLogSeverityAction } from "../actions/brain-dump/updateSeverityActions.js";

const router = express.Router();

// POST /api/brain-dump/process
router.post("/process", async (req, res) => {
    const { rawText, patientId, isFromCarer, carerId } = req.body;
    if (!rawText || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await processBrainDumpAction(rawText, patientId, isFromCarer, carerId);
    res.json(result);
});

// POST /api/brain-dump/transcribe
router.post("/transcribe", async (req, res) => {
    const { base64Audio, patientId } = req.body;
    if (!base64Audio) {
        return res.status(400).json({ success: false, error: "Missing base64Audio" });
    }
    const result = await transcribeAudioAction(base64Audio, patientId);
    res.json(result);
});

// PUT /api/brain-dump/severity
router.put("/severity", async (req, res) => {
    const { logId, pillar, severity } = req.body;
    if (!logId || !pillar || typeof severity !== "number") {
        return res.status(400).json({ success: false, error: "Missing or invalid fields" });
    }
    const result = await updateLogSeverityAction(logId, pillar, severity);
    res.json(result);
});

export default router;
