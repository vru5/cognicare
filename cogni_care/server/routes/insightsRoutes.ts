import express from "express";
import { 
    getInsightsEligibilityQuery, 
    getRangeAverageQuery,
    getMajorSymptomsQuery 
} from "../actions/insights/insightsQueries.js";
import { getAIInsightsSummary, getPredictiveAnalysis } from "../actions/insights/aiInsightsActions.js";

const router = express.Router();

// GET /api/insights/predictive
router.get("/predictive", async (req, res) => {
    const { patientId } = req.query;
    if (!patientId || typeof patientId !== "string") {
        return res.status(400).json({ success: false, error: "Missing patientId" });
    }
    
    try {
        const result = await getPredictiveAnalysis(patientId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// GET /api/insights/ai-summary
router.get("/ai-summary", async (req, res) => {
    const { patientId, date, endDate } = req.query;
    if (!patientId || typeof patientId !== "string" || !date || typeof date !== "string" || !endDate || typeof endDate !== "string") {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    try {
        const result = await getAIInsightsSummary(patientId, date, endDate);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// GET /api/insights/eligibility
router.get("/eligibility", async (req, res) => {
    const { patientId } = req.query;
    if (!patientId || typeof patientId !== "string") {
        return res.status(400).json({ success: false, error: "Missing patientId" });
    }
    
    try {
        const result = await getInsightsEligibilityQuery(patientId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// GET /api/insights/daily
router.get("/daily", async (req, res) => {
    const { patientId, date, endDate } = req.query;
    if (!patientId || typeof patientId !== "string" || !date || typeof date !== "string") {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    try {
        const result = await getRangeAverageQuery(patientId, date, endDate as string);
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
