import express from "express";
import { getCarerPatientsAction } from "../actions/carer/carerQueryActions.js";
import { markPatientAsViewedAction } from "../actions/carer/carerMutationActions.js";

const router = express.Router();

// GET /api/carer/patients
router.get("/patients", async (req, res) => {
    const { carerProfileId } = req.query;
    if (!carerProfileId || typeof carerProfileId !== "string") {
        return res.status(400).json({ success: false, error: "Missing carerProfileId" });
    }
    const result = await getCarerPatientsAction(carerProfileId);
    res.json(result);
});

// POST /api/carer/mark-viewed
router.post("/mark-viewed", async (req, res) => {
    const { carerProfileId, patientId } = req.body;
    if (!carerProfileId || !patientId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await markPatientAsViewedAction(carerProfileId, patientId);
    res.json(result);
});

export default router;
