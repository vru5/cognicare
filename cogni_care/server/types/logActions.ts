import { Prisma } from "@prisma/client";

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
    log?: any; // Will replace with more specific types if needed, or use SymptomRecord
    error?: string;
}

export interface LogsActionResponse {
    success: boolean;
    logs?: any[];
    restricted?: boolean;
    error?: string;
}
