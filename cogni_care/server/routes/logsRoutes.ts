import express from "express";
import { getLogsAction } from "../actions/logs/logQueries.js";
import { createSymptomLogAction, updateSymptomLogAction, deleteSymptomLogAction } from "../actions/logs/symptomLogActions.js";
import { createCarerNoteAction, addCarerCommentAction, updateCarerNoteAction, deleteCarerNoteAction } from "../actions/logs/carerNoteActions.js";

const router = express.Router();

// GET /api/logs
router.get("/", async (req, res) => {
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
router.post("/", async (req, res) => {
    const { patientId, rawText, isFromCarer, carerId } = req.body;
    if (!patientId || !rawText) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    let result;
    if (isFromCarer && carerId) {
        result = await createCarerNoteAction(patientId, carerId, rawText);
    } else {
        result = await createSymptomLogAction(patientId, rawText);
    }
    res.json(result);
});

// PATCH /api/logs
router.patch("/", async (req, res) => {
    const { logId, newText, patientId, isFromCarer, carerId } = req.body;
    if (!logId || !patientId || !newText) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    let result;
    if (isFromCarer && carerId) {
        result = await updateCarerNoteAction(logId, carerId, newText);
    } else {
        result = await updateSymptomLogAction(logId, patientId, newText);
    }
    res.json(result);
});

// DELETE /api/logs
router.delete("/", async (req, res) => {
    const { logId, patientId, isFromCarer, carerId } = req.body;
    if (!logId || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const isCarerBool = isFromCarer === true || isFromCarer === "true";
    const result = await deleteSymptomLogAction(logId, patientId, carerId, isCarerBool);
    res.json(result);
});

// POST /api/logs/comment
router.post("/comment", async (req, res) => {
    const { logId, text, carerId } = req.body;
    if (!logId || !text || !carerId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await addCarerCommentAction(logId, carerId, text);
    res.json(result);
});

// DELETE /api/logs/carer-note
router.delete("/carer-note", async (req, res) => {
    const { noteId, carerId, patientId } = req.body;
    if (!noteId || !carerId || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await deleteCarerNoteAction(noteId, carerId, patientId);
    res.json(result);
});

// DELETE /api/logs/comment (legacy but redirecting to note)
router.delete("/comment", async (req, res) => {
    const { commentId, carerId, patientId } = req.body;
    if (!commentId || !carerId || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await deleteCarerNoteAction(commentId, carerId, patientId);
    res.json(result);
});

export default router;
