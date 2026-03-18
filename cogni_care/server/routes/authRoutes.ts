import express from "express";
import { registerUser, getProfileAction, loginUser } from "../actions/auth/authActions.js";
import { AppError } from "../types/logsApi.js";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

// GET /api/auth/profile
router.get("/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ success: false, error: "Missing userId" });
    }
    const result = await getProfileAction(userId);
    res.json(result);
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
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
router.post("/register", async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (error: unknown) {
        const err = error as AppError;
        console.error("Registration error:", error);
        res.status(err.message === "Missing required fields" ? 400 : 500).json({ error: err.message });
    }
});

// POST /api/auth/push-token
router.post("/push-token", async (req, res) => {
    const { userId, pushToken } = req.body;
    if (!userId || !pushToken) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
        const patientResult = await prisma.profilePatient.updateMany({
            where: { userId },
            data: { pushToken },
        });

        if (patientResult.count > 0) {
            return res.json({ success: true, message: "Patient push token updated" });
        }

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

export default router;
