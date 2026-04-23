import express from "express";
import * as chatService from "../services/chatService.js";
import { getPatientCarersAction } from "../actions/settings/carerAccessActions.js";
import { getCarerPatientsWithCareCircleAction } from "../actions/carer/carerQueryActions.js";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

// Create thread from note
router.post("/threads/from-note", async (req, res) => {
    try {
        const { noteId, patientId, authorCarerId } = req.body;
        const result = await chatService.createThreadFromNote(noteId, patientId, authorCarerId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Resolve and delete thread
router.post("/threads/:id/resolve", async (req, res) => {
    try {
        const result = await chatService.resolveThread(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get or initialize direct chat
router.get("/direct", async (req, res) => {
    try {
        const { patientId, carerId } = req.query;
        if (!patientId || !carerId) {
            return res.status(400).json({ success: false, error: "Missing patientId or carerId" });
        }
        const result = await chatService.getOrCreateDirectChat(String(patientId), String(carerId));
        res.json(result);
    } catch (error: any) {
        console.error("[ChatRoutes] Error in /direct:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send message
router.post("/messages", async (req, res) => {
    try {
        const { senderId, content, threadId, directChatId } = req.body;
        const result = await chatService.sendMessage({ senderId, content, threadId, directChatId });
        res.json(result);
    } catch (error: any) {
        console.error("[ChatRoutes] Error in /messages (POST):", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get contacts (role-based)
router.get("/contacts", async (req, res) => {
    try {
        const { profileId, isCarer } = req.query;
        if (isCarer === "true") {
            const result = await getCarerPatientsWithCareCircleAction(String(profileId));
            res.json(result);
        } else {
            const result = await getPatientCarersAction(String(profileId));
            res.json(result);
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get active threads for a profile
router.get("/threads", async (req, res) => {
    try {
        const { profileId, isCarer } = req.query;
        
        // Resolve User ID for unread filtering
        let userId = "";
        if (isCarer === "true") {
            const profile = await prisma.profileCarer.findUnique({ where: { id: String(profileId) } });
            userId = profile?.userId || "";
        } else {
            const profile = await prisma.profilePatient.findUnique({ where: { id: String(profileId) } });
            userId = profile?.userId || "";
        }

        const threads = await prisma.chatThread.findMany({
            where: {
                OR: [
                    { patientId: String(profileId) },
                    { authorCarerId: String(profileId) }
                ],
                isResolved: false
            },
            orderBy: { createdAt: "desc" }
        });

        const threadsWithCounts = await Promise.all(threads.map(async (thread: any) => {
            const lastRead = (isCarer === "true") ? thread.carerLastReadAt : thread.patientLastReadAt;
            const unreadCount = await prisma.chatMessage.count({
                where: {
                    threadId: thread.id,
                    senderId: { not: userId }, // Use User ID
                    createdAt: { gt: lastRead }
                }
            });
            return { ...thread, unreadCount };
        }));

        res.json({ success: true, threads: threadsWithCounts });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get messages for a chat
router.get("/messages", async (req, res) => {
    try {
        const { threadId, directChatId } = req.query;
        const result = await chatService.getMessages(
            threadId ? String(threadId) : undefined,
            directChatId ? String(directChatId) : undefined
        );
        res.json(result);
    } catch (error: any) {
        console.error("[ChatRoutes] Error in /messages (GET):", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get total unread count for a user
router.get("/total-unread", async (req, res) => {
    try {
        const { profileId, isCarer } = req.query;
        const result = await chatService.getTotalUnreadCount(String(profileId), isCarer === "true");
        res.json(result);
    } catch (error: any) {
        console.error("[ChatRoutes] Error in /total-unread:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mark a chat as read
router.post("/read", async (req, res) => {
    try {
        const { chatId, type, profileId, isCarer } = req.body;
        const result = await chatService.markAsRead(chatId, type, String(profileId), isCarer === true);
        res.json(result);
    } catch (error: any) {
        console.error("[ChatRoutes] Error in /read:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
