/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X, Loader2, Activity, Smile, Brain, Moon, Users } from "lucide-react";
import { updateSymptomLog } from "@/features/logs/services/logsService";

const pillarConfig: any = {
    physical: { icon: Activity, color: "bg-red-100 text-red-700", label: "Physical" },
    mood: { icon: Smile, color: "bg-purple-100 text-purple-700", label: "Mood" },
    cognitive: { icon: Brain, color: "bg-blue-100 text-blue-700", label: "Cognitive" },
    sleep: { icon: Moon, color: "bg-indigo-100 text-indigo-700", label: "Sleep" },
    social: { icon: Users, color: "bg-green-100 text-green-700", label: "Social" },
};

export default function LogEntryCard({ log, patientId, onUpdate }: { log: any, patientId: string, onUpdate: (log: any) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState(log.rawText);
    const [isSaving, setIsSaving] = useState(false);

    // Filter out null pillars
    const activePillars = ["physical", "mood", "cognitive", "sleep", "social"].map((key) => {
        return { key, value: log[key] };
    }).filter((pillar) => pillar.value && pillar.value !== "N/A" && pillar.value.trim() !== "");

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

    const formattedTime = new Date(log.createdAt).toLocaleString();

    return (
        <div className="bg-card text-card-foreground rounded-[2rem] p-6 sm:p-8 border shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="text-sm text-muted-foreground font-medium">{formattedTime}</div>
                {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span className="sr-only">Edit</span>
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <Textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        className="w-full text-lg min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setNewText(log.rawText); }} disabled={isSaving}>
                            <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-muted-foreground text-lg mb-4 whitespace-pre-wrap">{log.rawText}</p>
            )}

            {activePillars.length > 0 && !isEditing && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {activePillars.map(({ key, value }) => {
                        const config = pillarConfig[key];
                        const Icon = config.icon;
                        return (
                            <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${config.color}`}>
                                <Icon className="w-3 h-3" />
                                <span>{config.label}: {value}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
