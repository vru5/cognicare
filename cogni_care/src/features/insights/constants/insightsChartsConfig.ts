export const PILLAR_COLORS: Record<string, string> = {
  Physical: "#ef4444",
  Mood: "#a855f7",
  Cognitive: "#3b82f6",
  Sleep: "#6366f1",
  Social: "#22c55e",
};

export const SYMPTOM_FULL_NAMES: Record<string, string> = {
  physical: "Physical",
  mood: "Mood",
  cognitive: "Cognitive",
  sleep: "Sleep",
  social: "Social",
};

export const SYMPTOM_EMOJIS: Record<string, string> = {
  physical: "🤕 Phy",
  mood: "😔 Mod",
  cognitive: "🧠 Cog",
  sleep: "😴 Slp",
  social: "💬 Soc",
};

export const getSymptomEmoji = (pillar: string) => SYMPTOM_EMOJIS[pillar.toLowerCase()] || pillar;
export const getSymptomFullName = (pillar: string) => SYMPTOM_FULL_NAMES[pillar.toLowerCase()] || pillar;
export const getPillarColor = (pillarName: string) => PILLAR_COLORS[pillarName] || "#888";
