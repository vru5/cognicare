import { LogSumaryCard } from "@/features/logs/types/logSummaryCard";
import { prisma } from "../../lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { ApiError } from "next/dist/server/api-utils";
import { Analysis, SymptomRecord, SymptomLogUpdateData } from "../../types/logsApi";
import { markPatientAsViewedAction } from "../carer/carerActions";

export async function getLogsAction(patientId: string) {
    try {
        const [symptomLogs, carerLogs] = await Promise.all([
            prisma.symptomLog.findMany({
                where: { patientId },
                include: {
                    comments: {
                        include: {
                            carer: {
                                include: { user: { select: { name: true } } },
                            },
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.carerLog.findMany({
                where: { patientId },
                include: {
                    carer: {
                        include: { user: { select: { name: true } } },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const formattedSymptomLogs = symptomLogs.map((log) => ({
            ...log,
            type: "patient" as const,
            comments: log.comments.map((c) => ({
                id: c.id,
                createdAt: c.createdAt,
                text: c.text,
                carerId: c.carerId,
                carerName: c.carer.user.name ?? undefined,
            })),
        }));

        const formattedCarerLogs = carerLogs.map((log) => ({
            id: log.id,
            createdAt: log.createdAt,
            patientId: log.patientId,
            rawText: log.rawText,
            isFromCarer: true,
            type: "carer" as const,
            carerName: log.carer.user.name ?? undefined,
            carerId: log.carerId,
            // Add null pillars for UI compatibility if needed
            physical: null,
            mood: null,
            cognitive: null,
            sleep: null,
            social: null,
        }));

        const allLogs = [...formattedSymptomLogs, ...formattedCarerLogs].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        return { success: true, logs: allLogs };
    } catch (error: unknown) {
        console.error("Failed to fetch logs:", error);
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function createManualLogAction(data: {
    patientId: string;
    rawText: string;
    isFromCarer?: boolean;
    carerId?: string;
}) {
    try {
        const { patientId, rawText, isFromCarer = false, carerId } = data;

        if (isFromCarer && carerId) {
            // Mark patient as viewed for this carer since they are interacting with it
            await markPatientAsViewedAction(carerId, patientId);

            const log = await prisma.carerLog.create({
                data: {
                    patientId,
                    carerId,
                    rawText,
                },
                include: {
                    carer: { include: { user: { select: { name: true } } } },
                },
            });
            return {
                success: true,
                log: {
                    ...log,
                    type: "carer" as const,
                    isFromCarer: true,
                    carerName: log.carer.user.name,
                    physical: null,
                    mood: null,
                    cognitive: null,
                    sleep: null,
                    social: null,
                },
            };
        }

        let analysis: Partial<Analysis> = {};

        // Disable AI analysis for carer logs even if they are stored in the patient table for some reason
        const apiKey = isFromCarer ? "" : (process.env.GEMINI_API_KEY || "").trim();
        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const safeText = mask(rawText || "");
            const prompt = `Analyze the following patient health log.
Categorize the content into exactly these fields: physical, mood, cognitive, sleep, social.
- For each field, provide a single word or very short phrase (e.g., 'Headache', 'Happy').
- If a category is not mentioned, return null for that field.
- Return output strictly as a JSON object.

Log: "${safeText}"`;

            try {
                let result;
                try {
                    result = await model.generateContent(prompt);
                } catch (err: unknown) {
                    const apiErr = err as ApiError;
                    if (apiErr?.message?.includes("503")) {
                        console.warn(
                            "Gemini 2.5 is overloaded, falling back to 1.5-flash...",
                        );
                        const fallbackModel = genAI.getGenerativeModel({
                            model: "gemini-1.5-flash",
                        });
                        result = await fallbackModel.generateContent(prompt);
                    } else {
                        throw apiErr;
                    }
                }
                let responseText = result.response.text();
                responseText = responseText
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();
                const parsedAnalysis = JSON.parse(responseText || "{}") as Analysis;
                analysis = parsedAnalysis;
            } catch (err) {
                console.warn("Gemini processing failed during manual creation:", err);
            }
        }

        const log = await prisma.symptomLog.create({
            data: {
                patientId,
                rawText,
                physical: analysis.physical || null,
                mood: analysis.mood || null,
                cognitive: analysis.cognitive || null,
                sleep: analysis.sleep || null,
                social: analysis.social || null,
            },
            include: {
                comments: true,
            },
        });

        return {
            success: true,
            log: { ...log, type: "patient" as const, comments: [] },
        };
    } catch (error) {
        console.error("Failed to create manual log:", error);
        return { success: false, error: "Failed to create log" };
    }
}

export async function updateSymptomLogAction(
    logId: string,
    data: {
        newText: string;
        patientId: string;
        isFromCarer?: boolean;
        carerId?: string;
    },
) {
    try {
        const { newText, patientId, isFromCarer = false, carerId } = data;

        const existingLog = await prisma.symptomLog.findUnique({
            where: { id: logId },
        });

        if (!existingLog || existingLog.patientId !== patientId) {
            return { success: false, error: "Log not found or unauthorized" };
        }

        if (isFromCarer) {
            // Update viewed status if we have the carerId
            if (carerId) {
                await markPatientAsViewedAction(carerId, patientId);
            }
            // Skip AI analysis for carer notes/updates
            const updatedLog = await prisma.symptomLog.update({
                where: { id: logId },
                data: { rawText: newText },
                include: {
                    comments: {
                        include: {
                            carer: { include: { user: { select: { name: true } } } },
                        },
                    },
                },
            });
            return {
                success: true,
                log: {
                    ...updatedLog,
                    type: "patient" as const,
                    comments: updatedLog.comments.map((c) => ({
                        id: c.id,
                        createdAt: c.createdAt,
                        text: c.text,
                        carerId: c.carerId,
                        carerName: c.carer.user.name ?? undefined,
                    })),
                },
            };
        }

        const apiKey = (process.env.GEMINI_API_KEY || "").trim();
        if (!apiKey) {
            return { success: false, error: "Server missing Gemini API Key" };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const safeText = mask(newText || "");

        const prompt = `Analyze the following patient health log.
    Categorize the content into exactly these fields: physical, mood, cognitive, sleep, social.
    - For each field, provide a single word or very short phrase (e.g., 'Headache', 'Happy', 'Exhausted').
    - If a category is not mentioned, return null for that field.
    - Return output strictly as a JSON object.
    
    Log: "${safeText}"`;

        let updateData: SymptomLogUpdateData = { rawText: newText };

        try {
            let result;
            try {
                result = await model.generateContent(prompt);
            } catch (err: unknown) {
                const apiErr = err as ApiError;
                if (apiErr?.message?.includes("503")) {
                    console.warn(
                        "Gemini 2.5 is overloaded, falling back to 1.5-flash...",
                    );
                    const fallbackModel = genAI.getGenerativeModel({
                        model: "gemini-1.5-flash",
                    });
                    result = await fallbackModel.generateContent(prompt);
                } else {
                    throw apiErr;
                }
            }
            let responseText = result.response.text();
            responseText = responseText
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
            const analysis: Analysis = JSON.parse(responseText || "{}");

            updateData = {
                ...updateData,
                physical: analysis.physical || null,
                mood: analysis.mood || null,
                cognitive: analysis.cognitive || null,
                sleep: analysis.sleep || null,
                social: analysis.social || null,
            };
        } catch (apiErr: unknown) {
            console.error("Gemini processing failed during update:", apiErr);
        }

        const updatedLog = await prisma.symptomLog.update({
            where: { id: logId },
            data: updateData,
            include: {
                comments: {
                    include: { carer: { include: { user: { select: { name: true } } } } },
                },
            },
        });

        return {
            success: true,
            log: {
                ...updatedLog,
                type: "patient" as const,
                comments: updatedLog.comments.map((c) => ({
                    id: c.id,
                    createdAt: c.createdAt,
                    text: c.text,
                    carerId: c.carerId,
                    carerName: c.carer.user.name ?? undefined,
                })),
            },
        };
    } catch (err: unknown) {
        console.error("Failed to update log:", err);
        return { success: false, error: "Failed to update log processing text" };
    }
}

export async function addCarerCommentAction(
    logId: string,
    data: { text: string; carerId: string },
) {
    try {
        const { text, carerId } = data;

        // Mark patient as viewed since the carer is commenting
        const existingLog = await prisma.symptomLog.findUnique({
            where: { id: logId },
            select: { patientId: true },
        });
        if (existingLog) {
            await markPatientAsViewedAction(carerId, existingLog.patientId);
        }

        const comment = await prisma.carerComment.create({
            data: {
                logId,
                carerId,
                text,
            },
            include: {
                log: {
                    include: {
                        comments: {
                            include: {
                                carer: { include: { user: { select: { name: true } } } },
                            },
                        },
                    },
                },
            },
        });

        return {
            success: true,
            log: {
                ...comment.log,
                type: "patient" as const,
                comments: comment.log.comments.map((c) => ({
                    id: c.id,
                    createdAt: c.createdAt,
                    text: c.text,
                    carerId: c.carerId,
                    carerName: c.carer.user.name ?? undefined,
                })),
            },
        };
    } catch (error) {
        console.error("Failed to add carer comment:", error);
        return { success: false, error: "Failed to add comment" };
    }
}

export async function deleteCarerLogAction(logId: string, carerId: string, patientId: string) {
    try {
        const log = await prisma.carerLog.findUnique({
             where: { id: logId }
        });

        if (!log || log.patientId !== patientId || log.carerId !== carerId) {
             return { success: false, error: "Log not found or unauthorized" };
        }

        await prisma.carerLog.delete({
            where: { id: logId }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete carer log:", error);
        return { success: false, error: "Failed to delete log" };
    }
}

export async function deleteCarerCommentAction(commentId: string, carerId: string, patientId: string) {
    try {
        const comment = await prisma.carerComment.findUnique({
            where: { id: commentId },
            include: { log: true }
        });

        if (!comment || comment.carerId !== carerId || comment.log.patientId !== patientId) {
            return { success: false, error: "Comment not found or unauthorized" };
        }

        await prisma.carerComment.delete({
            where: { id: commentId }
        });

        // Fetch updated log to return to frontend
        const updatedLog = await prisma.symptomLog.findUnique({
            where: { id: comment.logId },
            include: {
                comments: {
                    include: {
                        carer: { include: { user: { select: { name: true } } } },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!updatedLog) {
            return { success: true }; // Comment deleted, but log gone? Unexpected but success.
        }

        return {
            success: true,
            log: {
                ...updatedLog,
                type: "patient" as const,
                comments: updatedLog.comments.map((c) => ({
                    id: c.id,
                    createdAt: c.createdAt,
                    text: c.text,
                    carerId: c.carerId,
                    carerName: c.carer.user.name ?? undefined,
                })),
            },
        };
    } catch (error) {
        console.error("Failed to delete carer comment:", error);
        return { success: false, error: "Failed to delete comment" };
    }
}
