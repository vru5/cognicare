"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X, Loader2, Activity, Smile, Brain, Moon, Users, LucideIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateSymptomLog, addCarerComment } from "@/features/logs/services/logsService";
import { LogSumaryCard, MoodPillarsConfig, SymptomPillar } from "../types/logSummaryCard";
import { ADD_NOTE, CANCEL, CARER_NOTE, EDIT, EDIT_NOTE, EMPTY_NOTE_TEXT, SAVE_NOTE, SAVING_CHANGE, SAVING_TEXT } from "@/constants/logPage";
import { MessageSquare, BadgeCheck } from "lucide-react";

const pillarConfig: MoodPillarsConfig = {
    physical: { icon: Activity, color: "bg-red-100 text-red-700", label: "Physical" },
    mood: { icon: Smile, color: "bg-purple-100 text-purple-700", label: "Mood" },
    cognitive: { icon: Brain, color: "bg-blue-100 text-blue-700", label: "Cognitive" },
    sleep: { icon: Moon, color: "bg-indigo-100 text-indigo-700", label: "Sleep" },
    social: { icon: Users, color: "bg-green-100 text-green-700", label: "Social" },
};

export default function LogEntryCard({ log, patientId, onUpdate, onDelete, highlighted }: { log: LogSumaryCard, patientId: string, onUpdate: (log: LogSumaryCard) => void, onDelete?: (logId: string) => void, highlighted?: boolean }) {
    const { user } = useAuth();
    const isCarer = Boolean(user?.isCarer);
    const profileId = user?.profileId;

    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState(log.rawText);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isCommenting, setIsCommenting] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isSavingComment, setIsSavingComment] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // List of symptom pillars to display
    const symptomKeys: SymptomPillar[] = ["physical", "mood", "cognitive", "sleep", "social"];

    // Filter out null pillars
    const activePillars = symptomKeys.map((key) => {
        return { key, value: log[key] };
    }).filter((pillar) => pillar.value && pillar.value !== "N/A" && pillar.value !== "null" && pillar.value.trim() !== "");

    const handleSave = async () => {
        if (newText.trim() === log.rawText.trim()) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        const result = await updateSymptomLog(log.id, newText, patientId, isCarer, profileId || undefined);
        if (result.success) {
            onUpdate(result.log);
            setIsEditing(false);
        } else {
            alert("Failed to update log.");
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        const confirmMsg = log.isFromCarer ? "Delete this carer log?" : "Delete your log?";
        if (!confirm(confirmMsg)) return;

        setIsDeleting(true);
        const { deleteCarerLog, deleteSymptomLog } = await import("@/features/logs/services/logsService");
        
        const result = log.type === "carer" 
            ? await deleteCarerLog(log.id, profileId || "", log.patientId, isCarer)
            : await deleteSymptomLog(log.id, log.patientId, isCarer);

        if (result.success) {
            onDelete?.(log.id);
        } else {
            alert(result.error || "Failed to delete log.");
        }
        setIsDeleting(false);
    };

    const handleSaveComment = async () => {
        if (!commentText.trim() || !profileId) return;
        setIsSavingComment(true);
        const result = await addCarerComment(log.id, commentText, profileId);
        if (result.success) {
            onUpdate(result.log);
            setCommentText("");
            setIsCommenting(false);
        } else {
            alert("Failed to save comment.");
        }
        setIsSavingComment(false);
    };

    const formattedTime = mounted ? new Date(log.createdAt).toLocaleString() : "";

    return (
        <div className={`bg-card text-card-foreground rounded-[2rem] p-6 sm:p-8 border shadow-sm relative overflow-hidden transition-all ${highlighted ? 'ring-2 ring-sky-500 ring-offset-2' : ''}`}>
            {log.isFromCarer && (
                <div className="absolute top-0 right-0 bg-primary/10 text-primary px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <BadgeCheck className="w-3 h-3" />
                    Added by {log.carerName || "Carer"}
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-foreground font-bold opacity-60">{formattedTime}</div>
                {!isEditing && (
                    <div className="flex gap-2">
                        {/* Edit permissions: Carers edit carer logs, Patients edit patient logs */}
                        {((isCarer && log.isFromCarer) || (!isCarer && !log.isFromCarer)) && (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="rounded-full hover:bg-slate-100" disabled={isDeleting}>
                                <Edit2 className="w-4 h-4 mr-1 text-foreground" />
                                <span className="sr-only">{EDIT}</span>
                            </Button>
                        )}
                        {/* Delete permissions: Carers delete their own logs, Patients delete their own logs */}
                        {((isCarer && log.isFromCarer && log.carerId === profileId) || (!isCarer && !log.isFromCarer)) && (
                            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting} className="rounded-full hover:bg-red-50 hover:text-red-500">
                                {isDeleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4 mr-1 text-foreground" />}
                                <span className="sr-only">Delete</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <Textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        className="w-full text-lg min-h-[120px] rounded-2xl border-primary/20 focus:border-primary transition-all"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setNewText(log.rawText); }} disabled={isSaving} className="rounded-full">
                            <X className="w-4 h-4 mr-1" /> {CANCEL}
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="rounded-full px-6">
                            {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                            {isSaving ? `${SAVING_TEXT}` : `${SAVING_CHANGE}`}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-foreground text-xl font-medium leading-relaxed whitespace-pre-wrap">{log.rawText}</p>

                    {/* Pillars section */}
                    {activePillars.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {activePillars.map(({ key, value }) => {
                                const config = pillarConfig[key as keyof MoodPillarsConfig];
                                const Icon = config?.icon as LucideIcon;
                                return (
                                    <div key={key} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm ${config?.color}`}>
                                        <Icon className="w-3 h-3 text-current" />
                                        <span>{config?.label}: {value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Carer Comment Section */}
                    {log.type === "patient" && (isCarer || (log.notes && log.notes.length > 0)) && (
                        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                {(log.notes && log.notes.length > 0) || isCommenting ? (
                                    <div className="flex items-center gap-2 text-primary">
                                        <MessageSquare className="w-5 h-5" />
                                        <h4 className="text-sm font-black uppercase tracking-widest">
                                            {(log.notes && log.notes.length > 0)
                                                ? `${log.notes[0]?.carerName || "Carer"}'s Note`
                                                : isCarer && user?.name
                                                    ? `${user.name}'s ${CARER_NOTE}`
                                                    : CARER_NOTE}
                                        </h4>
                                    </div>
                                ) : (
                                    <div />
                                )}
                                {isCarer && !isCommenting && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsCommenting(true)}
                                        className="text-primary hover:bg-primary/5 rounded-full"
                                    >
                                        {ADD_NOTE}
                                    </Button>
                                )}
                            </div>

                            {isCommenting && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Write your observation or note here..."
                                        className="w-full min-h-[80px] rounded-2xl border-primary/20"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setIsCommenting(false)} disabled={isSavingComment} className="rounded-full">
                                            {CANCEL}
                                        </Button>
                                        <Button size="sm" onClick={handleSaveComment} disabled={isSavingComment} className="rounded-full px-6 bg-primary text-white">
                                            {isSavingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                            {SAVE_NOTE}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {(log.notes && log.notes.length > 0) ? (
                                <div className="space-y-3">
                                    {log.notes.map((comment) => (
                                        <div key={comment.id} className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-1 relative group">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-primary/60 uppercase">
                                                <span>{comment.carerName || "Carer"}</span>
                                                <div className="flex items-center gap-2">
                                                    <span>{mounted ? new Date(comment.createdAt).toLocaleDateString() : ""}</span>
                                                    {isCarer && comment.carerId === profileId && (
                                                        <button 
                                                            onClick={async () => {
                                                                if (!confirm("Delete this note?")) return;
                                                                const { deleteCarerNote } = await import("@/features/logs/services/logsService");
                                                                const result = await deleteCarerNote(comment.id, profileId, log.patientId, isCarer);
                                                                if (result.success) {
                                                                    onUpdate(result.log);
                                                                } else {
                                                                    alert("Failed to delete note.");
                                                                }
                                                            }}
                                                            className="text-primary/40 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="italic text-foreground/80 leading-relaxed">&ldquo;{comment.text}&rdquo;</p>
                                        </div>
                                    ))}
                                </div>
                            ) : !isCommenting && isCarer ? (
                                <p className="text-muted-foreground text-sm italic py-2">{EMPTY_NOTE_TEXT}</p>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
