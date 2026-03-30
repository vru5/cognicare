import { Prisma } from "@prisma/client";
import { SymptomRecord } from "./logsApi.js";

export type CarerNoteWithUser = Prisma.CarerNoteGetPayload<{
    include: {
        carer: {
            include: { user: { select: { name: true } } }
        }
    }
}>;

export interface PermissionCheckResult {
    success: boolean;
    restricted?: boolean;
    error?: string;
}

export interface LogActionResponse {
    success: boolean;
    log?: SymptomRecord; // Replaced any with specific type
    error?: string;
}

export interface LogsActionResponse {
    success: boolean;
    logs?: SymptomRecord[];
    restricted?: boolean;
    error?: string;
}
