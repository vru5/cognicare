import { Activity, Smile, Brain, Moon, Users } from "lucide-react";
import { MoodPillarsConfig, SymptomPillar } from "../types/logTypes";

export const PILLAR_CONFIG: MoodPillarsConfig = {
  physical: {
    icon: Activity,
    color: "bg-red-100 text-red-700 border-red-200",
    label: "Physical",
  },
  mood: {
    icon: Smile,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    label: "Mood",
  },
  cognitive: {
    icon: Brain,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Cognitive",
  },
  sleep: {
    icon: Moon,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    label: "Sleep",
  },
  social: {
    icon: Users,
    color: "bg-green-100 text-green-700 border-green-200",
    label: "Social",
  },
};

export const PILLAR_CATEGORIES: { key: SymptomPillar; label: string }[] = [
  { key: "physical", label: "PHYSICAL" },
  { key: "mood", label: "MOOD" },
  { key: "cognitive", label: "COGNITIVE" },
  { key: "sleep", label: "SLEEP" },
  { key: "social", label: "SOCIAL" },
];
