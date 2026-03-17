"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Users, FileText } from "lucide-react";
import { updateCarerAccess } from "@/features/settings/services/settingsService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface CarerAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    carer: {
        id: string;
        name: string;
        accessSymptomLogs: boolean;
        accessCareCircle: boolean;
    } | null;
    onSuccess: () => void;
}

export default function CarerAccessModal({ isOpen, onClose, carer, onSuccess }: CarerAccessModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [accessSymptomLogs, setAccessSymptomLogs] = useState(true);
    const [accessCareCircle, setAccessCareCircle] = useState(true);

    useEffect(() => {
        if (carer) {
            setAccessSymptomLogs(carer.accessSymptomLogs);
            setAccessCareCircle(carer.accessCareCircle);
        }
    }, [carer]);

    const handleSave = async () => {
        if (!user?.profileId || !carer) return;

        setLoading(true);
        try {
            const result = await updateCarerAccess(user.profileId, carer.id, {
                accessSymptomLogs,
                accessCareCircle,
            });

            if (result.success) {
                onSuccess();
                onClose();
            } else {
                alert(result.error || "Failed to update access");
            }
        } catch (error) {
            console.error("Error updating access:", error);
            alert("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!carer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-xl border-none shadow-2xl bg-white/95 backdrop-blur-xl p-0 overflow-hidden ring-1 ring-slate-200 [&>button]:hidden">
                <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                    <DialogTitle className="text-2xl font-black text-foreground tracking-tight">Manage Access</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium pt-1">
                        Configure permissions for <span className="text-primary font-bold">{carer.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="px-8 pb-2 divide-y divide-slate-100">
                    {/* Symptom Records Toggle */}
                    <div className="flex items-center justify-between gap-4 py-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl text-primary">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold text-foreground">Symptom Records</Label>
                                <p className="text-xs text-muted-foreground font-medium">Allow viewing your health logs</p>
                            </div>
                        </div>
                        <Switch
                            checked={accessSymptomLogs}
                            onCheckedChange={setAccessSymptomLogs}
                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300"
                        />
                    </div>

                    {/* CareCircle Toggle */}
                    <div className="flex items-center justify-between gap-4 py-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold text-foreground">CareCircle</Label>
                                <p className="text-xs text-muted-foreground font-medium">Allow viewing related carers/family</p>
                            </div>
                        </div>
                        <Switch
                            checked={accessCareCircle}
                            onCheckedChange={setAccessCareCircle}
                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300"
                        />
                    </div>
                </div>

                <DialogFooter className="p-8 pt-0 flex gap-3 sm:flex-row flex-col">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-14 rounded-2xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 h-14 rounded-2xl font-black bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Save Permissions"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
