import express from "express";
import { getFullProfileAction } from "../actions/settings/profileActions.js";
import { getPatientCarersAction, updateCarerAccessAction } from "../actions/settings/carerAccessActions.js";

const router = express.Router();

// GET /api/settings/profile
router.get("/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ success: false, error: "Missing userId" });
    }
    const result = await getFullProfileAction(userId);
    res.json(result);
});

// GET /api/settings/carers
router.get("/carers", async (req, res) => {
    const { patientProfileId } = req.query;
    if (!patientProfileId || typeof patientProfileId !== "string") {
        return res.status(400).json({ success: false, error: "Missing patientProfileId" });
    }
    const result = await getPatientCarersAction(patientProfileId);
    res.json(result);
});

// PATCH /api/settings/carers
router.patch("/carers", async (req, res) => {
    const { patientProfileId, carerProfileId, data } = req.body;
    if (!patientProfileId || !carerProfileId || !data) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await updateCarerAccessAction(patientProfileId, carerProfileId, data);
    res.json(result);
});

export default router;
