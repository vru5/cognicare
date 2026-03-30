export const SYMPTOM_ROWS = [
  "Quick Temper, Anger, Irritability",
  "Physical & Verbal Outbursts",
  "Impulsivity, Lack of Self Control",
  "Inappropriate Behavior, Aggressiveness",
  "Addictive Behavior",
  "Memory Problems",
  "Poor Judgment",
  "Trouble Concentrating & Learning",
  "Difficulty Following Verbal Exchanges",
  "Trouble Prioritizing, Planning & Organizing",
  "Difficulty Putting Ideas on Paper",
  "Difficulty Reading",
  "Deficient Handwriting",
  "Depression, Feeling Hopeless, Helpless",
  "Anxiety, Feeling of Doom",
  "Lack of Motivation, Initiative",
  "Feeling Worthless, Low Self Esteem",
  "Reclusiveness",
  "Suicidal Thoughts",
  "Paranoia",
  "Apathy, Lack of Empathy",
  "Trouble Sleeping",
  "Frequent Headaches",
  "Unexplained Localized Pain",
  "Muscle Spasms",
  "Slurred Speech",
  "Ringing in Ears",
  "Sensitivity to Light",
  "Sensitivity to Noise",
  "Balance and Vertigo Issues",
  "Brain Fog",
  "Extreme Fatigue",
  "Short Term Memory Loss",
  "Explosive Anger",
  "Extreme Depression",
  "Noise Sensitivity",
  "Light Sensitivity",
  "Loss in Vision Focus",
  "Dark Thoughts",
  "Loss of Sense of Time",
];

export const PILLARS = ["physical", "cognitive", "mood", "sleep", "social"];

export const PILLAR_META = {
  physical: { label: "Physical", color: "#ef4444", bg: "#fef2f2" },
  cognitive: { label: "Cognitive", color: "#3b82f6", bg: "#eff6ff" },
  mood: { label: "Mood", color: "#a855f7", bg: "#f3e8ff" },
  sleep: { label: "Sleep", color: "#6366f1", bg: "#eef2ff" },
  social: { label: "Social", color: "#22c55e", bg: "#f0fdf4" }
} as Record<string, { label: string, color: string, bg: string }>;

export const SYMPTOM_LIST = SYMPTOM_ROWS.map(sym => {
  let pillar = "physical";
  if (["Trouble Sleeping"].includes(sym)) pillar = "sleep";
  else if (["Quick Temper, Anger, Irritability", "Depression, Feeling Hopeless, Helpless", "Anxiety, Feeling of Doom", "Feeling Worthless, Low Self Esteem", "Suicidal Thoughts", "Explosive Anger", "Extreme Depression", "Dark Thoughts"].includes(sym)) pillar = "mood";
  else if (["Memory Problems", "Poor Judgment", "Trouble Concentrating & Learning", "Difficulty Following Verbal Exchanges", "Trouble Prioritizing, Planning & Organizing", "Difficulty Putting Ideas on Paper", "Difficulty Reading", "Deficient Handwriting", "Brain Fog", "Short Term Memory Loss", "Loss of Sense of Time"].includes(sym)) pillar = "cognitive";
  else if (["Impulsivity, Lack of Self Control", "Inappropriate Behavior, Aggressiveness", "Addictive Behavior", "Lack of Motivation, Initiative", "Reclusiveness", "Paranoia", "Apathy, Lack of Empathy", "Physical & Verbal Outbursts"].includes(sym)) pillar = "social";
  return { key: sym, label: sym, pillar };
});
