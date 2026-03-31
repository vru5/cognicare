import express from "express";
import { 
    getInsightsEligibilityQuery, 
    getAllTimeLogAggregatesQuery, 
    getDailyAverageQuery,
    getMajorSymptomsQuery 
} from "../actions/insights/insightsQueries.js";

const router = express.Router();

// GET /api/insights/eligibility
router.get("/eligibility", async (req, res) => {
    const { patientId } = req.query;
    if (!patientId || typeof patientId !== "string") {
        return res.status(400).json({ success: false, error: "Missing patientId" });
    }
    
    try {
        const result = await getInsightsEligibilityQuery(patientId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// GET /api/insights/aggregates
router.get("/aggregates", async (req, res) => {
    const { patientId } = req.query;
    if (!patientId || typeof patientId !== "string") {
        return res.status(400).json({ success: false, error: "Missing patientId" });
    }
    
    try {
        const result = await getAllTimeLogAggregatesQuery(patientId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// GET /api/insights/daily
router.get("/daily", async (req, res) => {
    const { patientId, date } = req.query;
    if (!patientId || typeof patientId !== "string" || !date || typeof date !== "string") {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    try {
        const result = await getDailyAverageQuery(patientId, date);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// GET /api/insights/major-symptoms
router.get("/major-symptoms", async (req, res) => {
    const { patientId } = req.query;
    if (!patientId || typeof patientId !== "string") {
        return res.status(400).json({ success: false, error: "Missing patientId" });
    }
    
    try {
        const result = await getMajorSymptomsQuery(patientId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

export default router;
