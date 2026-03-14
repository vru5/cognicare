"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X, Loader2, Activity, Smile, Brain, Moon, Users, LucideIcon } from "lucide-react";
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

export default function LogEntryCard({ log, patientId, onUpdate }: { log: LogSumaryCard, patientId: string, onUpdate: (log: LogSumaryCard) => void }) {
    const { user } = useAuth();
    const isCarer = user?.isCarer;

    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState(log.rawText);
    const [isSaving, setIsSaving] = useState(false);

    const [isCommenting, setIsCommenting] = useState(false);
    const [commentText, setCommentText] = useState(log.carerComment || "");
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
        const result = await updateSymptomLog(log.id, newText, patientId);
        if (result.success) {
            onUpdate(result.log);
            setIsEditing(false);
        } else {
            alert("Failed to update log. Ensure API keys are set up on the server.");
        }
        setIsSaving(false);
    };

    const handleSaveComment = async () => {
        setIsSavingComment(true);
        const result = await addCarerComment(log.id, commentText, patientId);
        if (result.success) {
            onUpdate(result.log);
            setIsCommenting(false);
        } else {
            alert("Failed to save comment.");
        }
        setIsSavingComment(false);
    };

    const formattedTime = mounted ? new Date(log.createdAt).toLocaleString() : "";

    return (
        <div className="bg-card text-card-foreground rounded-[2rem] p-6 sm:p-8 border shadow-sm relative overflow-hidden">
            {log.isFromCarer && (
                <div className="absolute top-0 right-0 bg-primary/10 text-primary px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <BadgeCheck className="w-3 h-3" />
                    Added by Carer
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-foreground font-bold opacity-60">{formattedTime}</div>
                {!isEditing && !isCarer && !log.isFromCarer && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="rounded-full hover:bg-slate-100">
                        <Edit2 className="w-4 h-4 mr-1 text-foreground" />
                        <span className="sr-only">{EDIT}</span>
                    </Button>
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
                    {(isCarer || log.carerComment) && (
                        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary">
                                    <MessageSquare className="w-5 h-5" />
                                    <h4 className="text-sm font-black uppercase tracking-widest">{CARER_NOTE}</h4>
                                </div>
                                {isCarer && !isCommenting && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsCommenting(true)}
                                        className="text-primary hover:bg-primary/5 rounded-full"
                                    >
                                        {log.carerComment ? `${EDIT_NOTE}` : `${ADD_NOTE}`}
                                    </Button>
                                )}
                            </div>

                            {isCommenting ? (
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
                            ) : log.carerComment ? (
                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 italic text-foreground/80 leading-relaxed">
                                    &ldquo;{log.carerComment}&rdquo;
                                </div>
                            ) : isCarer ? (
                                <p className="text-muted-foreground text-sm italic py-2">{EMPTY_NOTE_TEXT}</p>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
