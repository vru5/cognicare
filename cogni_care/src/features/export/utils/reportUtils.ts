/**
 * Shared utility functions for common report calculations.
 */

export interface PillarSymptom {
  key: string;
}

export interface Pillar {
  symptoms: PillarSymptom[];
}

export function pillarAvg(pillar: Pillar, scores: Record<string, number>): number {
  if (!pillar.symptoms) return 0;
  const vals = pillar.symptoms.map((s: PillarSymptom) => scores[s.key] || 0);
  return +(vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1);
}

export function overallTotal(scores: Record<string, number>): number {
  return Object.values(scores).reduce((a: number, b: number) => a + b, 0);
}
