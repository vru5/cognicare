import { SymptomPillar } from "@/features/logs/types/logTypes";

export type PieChartData = { name: string; value: number; fill: string }[];

export type DailyAverage = Record<SymptomPillar, number>;
