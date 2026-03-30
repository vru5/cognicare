"use client";

import React, { useState, useRef } from "react";
import { generatePdfFromElement } from "../services/pdfService";
import { Loader2, Download } from "lucide-react";

// ── Data ────────────────────────────────────────────────────────────────────

const PATIENT = { name: "Jane Doe", id: "CTE-00421", age: 47, consultant: "Dr. R. Patel", diagnosisDate: "12 Jan 2024" };
const DATE_A = "4 Mar 2026";
const DATE_B = "18 Mar 2026";
const OVERALL_ENTRIES = 87;
const PATIENT_LOGS = 32;
const CARER_LOGS = 55;

const PILLARS = [
  {
    key: "mood", label: "Mood", icon: "🌤", color: "#e8a838", light: "#fdf6e7", border: "#f0c96a",
    symptoms: [
      { key: "irritability", label: "Irritability" },
      { key: "depression", label: "Low mood" },
      { key: "emotional", label: "Emotional dysregulation" },
    ],
  },
  {
    key: "physical", label: "Physical", icon: "💪", color: "#c0674a", light: "#fdf1ed", border: "#e8a090",
    symptoms: [
      { key: "headache", label: "Headache" },
      { key: "pain", label: "Pain" },
      { key: "nausea", label: "Nausea" },
    ],
  },
  {
    key: "cognitive", label: "Cognitive", icon: "🧠", color: "#6b52ae", light: "#f3f0fb", border: "#b8a8e0",
    symptoms: [
      { key: "memory", label: "Memory lapses" },
      { key: "focus", label: "Focus/concentration" },
      { key: "confusion", label: "Confusion" },
    ],
  },
  {
    key: "social", label: "Social", icon: "🤝", color: "#2e8b6e", light: "#edf7f4", border: "#7ecbb8",
    symptoms: [
      { key: "withdrawal", label: "Social withdrawal" },
      { key: "communication", label: "Communication difficulty" },
      { key: "relationships", label: "Relationship strain" },
    ],
  },
  {
    key: "sleep", label: "Sleep", icon: "🌙", color: "#3d6b8f", light: "#eef4f9", border: "#8ab8d8",
    symptoms: [
      { key: "insomnia", label: "Insomnia" },
      { key: "quality", label: "Sleep quality" },
      { key: "fatigue", label: "Daytime fatigue" },
    ],
  },
];

// Global Averages (Weighted Combined)
const OVERALL_PILLAR_AVG = { mood: 5.8, physical: 6.4, cognitive: 6.9, social: 4.7, sleep: 7.1 };

// Source-Specific Averages (Simulated)
const PATIENT_PILLAR_AVG = { mood: 6.2, physical: 6.0, cognitive: 7.2, social: 4.2, sleep: 7.5 };
const CARER_PILLAR_AVG   = { mood: 5.4, physical: 6.8, cognitive: 6.6, social: 5.2, sleep: 6.7 };

const PILLAR_PERCENT = (() => {
  const total = Object.values(OVERALL_PILLAR_AVG).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.entries(OVERALL_PILLAR_AVG).map(([k, v]) => [k, +((v / total) * 100).toFixed(1)]));
})();

const MONTHLY_TREND = {
  mood:      [6.2, 6.0, 5.5, 5.9, 5.6, 5.8],
  physical:  [5.8, 6.2, 6.8, 6.5, 6.1, 6.4],
  cognitive: [6.5, 6.8, 7.1, 6.9, 6.7, 6.9],
  social:    [4.2, 4.5, 4.9, 4.8, 4.6, 4.7],
  sleep:     [7.4, 7.2, 7.0, 7.3, 7.0, 7.1],
};
// Simulated source-specific paths for Sparklines
const PATIENT_MONTHLY_TREND = Object.fromEntries(Object.entries(MONTHLY_TREND).map(([k, v]) => [k, v.map(n => n + (Math.random() * 0.8 - 0.4))]));
const CARER_MONTHLY_TREND   = Object.fromEntries(Object.entries(MONTHLY_TREND).map(([k, v]) => [k, v.map(n => n + (Math.random() * 0.8 - 0.4))]));

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

// Breakdown for Date A (Patient vs Carer)
const SCORES_A_P = { irritability: 6, depression: 5, emotional: 7, headache: 4, pain: 4, nausea: 8, memory: 7, focus: 8, confusion: 5, withdrawal: 6, communication: 5, relationships: 4, insomnia: 7, quality: 6, fatigue: 8 };
const SCORES_A_C = { irritability: 5, depression: 4, emotional: 6, headache: 5, pain: 5, nausea: 7, memory: 6, focus: 7, confusion: 4, withdrawal: 7, communication: 6, relationships: 5, insomnia: 6, quality: 5, fatigue: 7 };

// Breakdown for Date B (Patient vs Carer)
const SCORES_B_P = { irritability: 4, depression: 6, emotional: 5, headache: 9, pain: 10, nausea: 3, memory: 8, focus: 7, confusion: 6, withdrawal: 7, communication: 6, relationships: 5, insomnia: 5, quality: 7, fatigue: 6 };
const SCORES_B_C = { irritability: 5, depression: 5, emotional: 6, headache: 10, pain: 8, nausea: 4, memory: 7, focus: 6, confusion: 7, withdrawal: 8, communication: 7, relationships: 6, insomnia: 6, quality: 6, fatigue: 7 };

// Calculate combined (Averages)
const SCORES_A = Object.fromEntries(Object.keys(SCORES_A_P).map(k => [k, +(((SCORES_A_P as any)[k] + (SCORES_A_C as any)[k]) / 2).toFixed(1)])) as Record<string, number>;
const SCORES_B = Object.fromEntries(Object.keys(SCORES_B_P).map(k => [k, +(((SCORES_B_P as any)[k] + (SCORES_B_C as any)[k]) / 2).toFixed(1)])) as Record<string, number>;

const OVERALL_INSIGHTS = [
  { pillar: "Sleep", icon: "🌙", color: "#3d6b8f", bg: "#eef4f9", type: "Highest Burden", title: "Sleep is your most persistent challenge", body: "Sleep has averaged 7.1/10 since diagnosis — the highest burden of all 5 pillars. Chronic sleep disruption in CTE can amplify cognitive and physical symptoms." },
  { pillar: "Agreement", icon: "🤝", color: "#2e8b6e", bg: "#edf7f4", type: "Perception Match", title: "Strong alignment on Social burden", body: "Both Patient and Carer reports show near-identical scores for Social withdrawal and Relationship strain. This consistency ensures the care team has a clear, vuh-nified picture of this pillar." },
  { pillar: "Mood", icon: "🌤", color: "#e8a838", bg: "#fdf6e7", type: "Perception Gap", title: "Source mismatch in Mood reporting", body: "Patient reports mood easing (6.2 → 5.8), while Carer reports persistent irritability. This gap suggests symptoms may be masked during social interactions or more visible at home." },
  { pillar: "Cognitive", icon: "🧠", color: "#6b52ae", bg: "#f3f0fb", type: "Worsening Trend", title: "Cognitive scores trending upward", body: "The cognitive pillar has trended upward from 6.5 in October to 6.9 in March. Both sources agree on the increase in memory lapses." }
];

const AI_INSIGHTS = [
  { pillar: "Physical", type: "Perception", icon: "🔍", color: "#c0674a", bg: "#fdf1ed", title: "Significant Perception Gap in Pain", body: "On 18 Mar, Patient reported 10/10 Pain, while Carer noted 8/10. High-severity pain may lead to patient isolation or 'suffering in silence'. This 2-point gap warrants discussion." },
  { pillar: "Sleep", type: "Alignment", icon: "🌙", color: "#3d6b8f", bg: "#eef4f9", title: "Both agree: Sleep is improving", body: "Insomnia and Fatigue reduced significantly in both reporting streams. This alignment validates the effectiveness of recent sleep routine adjustments." },
  { pillar: "Cognitive", type: "trend", icon: "🧠", color: "#6b52ae", bg: "#f3f0fb", title: "Cognitive fluctuations noted by Carer", body: "While patient scores remain stable, the carer reports increased 'Confusion' on high-pain days. This may indicate cognitive fatigue during physical spikes." }
];

const CARE_TEAM_POINTS = [
  "Pain score of 10/10 vs 8/10 (P vs C) — discuss discrepancy and actual intensity",
  "Sleep has been the highest-burden pillar since diagnosis — verified by both reporting sources",
  "Social withdrawal increasing — Carer identifies this more frequently than Patient",
  "Explore if Mood symptoms are more apparent to the Carer than the Patient"
];

const COMPARISON_DATA = {
  totalA: overallTotal(SCORES_A),
  totalB: overallTotal(SCORES_B),
  logsCountA: 1,
  logsCountB: 1,
  overallChange: +(overallTotal(SCORES_B) - overallTotal(SCORES_A)).toFixed(1),
  biggestWorsening: { label: "Physical", scoreA: 4, scoreB: 9 }, // Simplified for mockup
  biggestImprovement: { label: "Social", scoreA: 5.5, scoreB: 4.2 }
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function pillarAvg(pillar: any, scores: Record<string, number>) {
  const vals = pillar.symptoms.map((s: any) => scores[s.key]);
  return +(vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1);
}
function overallTotal(scores: Record<string, number>) { return Object.values(scores).reduce((a: number, b: number) => a + b, 0); }
function delta(key: string) { return (SCORES_B as any)[key] - (SCORES_A as any)[key]; }
function pillarDelta(pillar: any) { return +(pillarAvg(pillar, SCORES_B) - pillarAvg(pillar, SCORES_A)).toFixed(1); }

// ── Shared Components ────────────────────────────────────────────────────────

function PageShell({ children, pageNum, totalPages = 3 }: { children: React.ReactNode, pageNum: number, totalPages?: number }) {
  return (
    <div style={{
      width: 794, minHeight: 1123, background: "#fff",
      fontFamily: "'Lora', 'Georgia', serif",
      position: "relative", overflow: "hidden",
      boxShadow: "0 8px 40px rgba(0,0,0,0.13)",
      marginBottom: 32,
    }}>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        borderTop: "1px solid #eee", padding: "10px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, color: "#bbb", letterSpacing: 0.4,
      }}>
        <span>CTE Health Monitor · Source-Categorized Report · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
        <span>P: {PATIENT.name} · {PATIENT.id}</span>
        <span>Page {pageNum} of {totalPages}</span>
      </div>
    </div>
  );
}

function ReportHeader({ subtitle }: { subtitle: string }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
      padding: "26px 40px 22px",
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #5fa8d3, #3d6b8f)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
          }}>🧬</div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>CTE Health Monitor</div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{subtitle}</div>
          </div>
        </div>
        <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{PATIENT.name}</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 3 }}>
          ID: {PATIENT.id} &nbsp;·&nbsp; Consultant: {PATIENT.consultant}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{
          background: "rgba(255,255,255,0.08)", borderRadius: 10,
          padding: "10px 16px", border: "1px solid rgba(255,255,255,0.12)",
        }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>Source Breakdown</div>
          <div style={{ display: "flex", gap: 10 }}>
             <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: 10 }}>
               <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 }}>PATIENT</div>
               <div style={{ color: "#5fa8d3", fontSize: 12, fontWeight: 800 }}>{PATIENT_LOGS} logs</div>
             </div>
             <div>
               <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 }}>CARER</div>
               <div style={{ color: "#2e8b6e", fontSize: 12, fontWeight: 800 }}>{CARER_LOGS} logs</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pie Chart ────────────────────────────────────────────────────────────────

function DonutChart() {
  const cx = 100, cy = 100, r = 85, innerR = 55;
  let cumAngle = -Math.PI / 2;

  const slices = PILLARS.map(p => {
    const pct = (PILLAR_PERCENT as any)[p.key];
    const angle = (pct / 100) * 2 * Math.PI;
    const slice = { ...p, pct, startAngle: cumAngle, endAngle: cumAngle + angle };
    cumAngle += angle;
    return slice;
  });

  const arcPath = (sa: number, ea: number, outerR: number, iR: number) => {
    const x1 = cx + outerR * Math.cos(sa), y1 = cy + outerR * Math.sin(sa);
    const x2 = cx + outerR * Math.cos(ea), y2 = cy + outerR * Math.sin(ea);
    const ix1 = cx + iR * Math.cos(ea), iy1 = cy + iR * Math.sin(ea);
    const ix2 = cx + iR * Math.cos(sa), iy2 = cy + iR * Math.sin(sa);
    const large = ea - sa > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${outerR},${outerR} 0 ${large},1 ${x2},${y2} L${ix1},${iy1} A${iR},${iR} 0 ${large},0 ${ix2},${iy2} Z`;
  };

  const highestPillar = PILLARS.reduce((a, b) => (PILLAR_PERCENT as any)[a.key] > (PILLAR_PERCENT as any)[b.key] ? a : b);

  return (
    <svg width={200} height={200} viewBox="0 0 200 200">
      {slices.map(s => (
        <path key={s.key} d={arcPath(s.startAngle, s.endAngle, r, innerR)} fill={s.color} stroke="#fff" strokeWidth={1} />
      ))}
      {slices.map(s => {
        const mid = (s.startAngle + s.endAngle) / 2;
        const x = cx + (r - 15) * Math.cos(mid), y = cy + (r - 15) * Math.sin(mid);
        if (s.pct < 5) return null;
        return <text key={s.key} x={x} y={y} fill="#fff" fontSize={9} fontWeight={800} textAnchor="middle" dominantBaseline="middle">{s.pct}%</text>
      })}
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={8} fontWeight={800} fill="#999" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Highest</text>
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight={900} fill={highestPillar.color}>{highestPillar.label}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={14} fontWeight={900} fill="#1a1a2e">{(PILLAR_PERCENT as any)[highestPillar.key]}%</text>
    </svg>
  );
}

function PillarRadar({ scoresA, scoresB }: { scoresA: any, scoresB: any }) {
  const cx = 130, cy = 130, r = 70;
  const totalPillars = PILLARS.length;

  const point = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / totalPillars - Math.PI / 2;
    return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle) };
  };

  const labelPoint = (i: number, dist: number) => {
    const angle = (Math.PI * 2 * i) / totalPillars - Math.PI / 2;
    return { x: cx + r * dist * Math.cos(angle), y: cy + r * dist * Math.sin(angle) };
  };

  const toPath = (pts: {x: number, y: number}[]) => 
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
    
  const grid = [0.25, 0.5, 0.75, 1.0];
  const scaleA = PILLARS.map(p => (scoresA[p.key] || 0) / 10);
  const scaleB = PILLARS.map(p => (scoresB[p.key] || 0) / 10);
  
  return (
    <div style={{ width: 260, height: 260, margin: '0 auto' }}>
      <svg width="100%" height="100%" viewBox="0 0 260 260">
        {grid.map((g: number) => (
          <polygon key={g} 
            points={PILLARS.map((_, i) => { const p = point(i, g); return `${p.x},${p.y}`; }).join(" ")} 
            fill="none" stroke="#e0dcd6" strokeWidth={0.7} strokeDasharray="2,2" />
        ))}
        {PILLARS.map((_, i) => { 
          const p = point(i, 1); 
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e0dcd6" strokeWidth={0.7} />; 
        })}
        <path d={toPath(scaleA.map((s, i) => point(i, s)))} fill="#3d6b8f" fillOpacity={0.15} stroke="#3d6b8f" strokeWidth={1.5} />
        <path d={toPath(scaleB.map((s, i) => point(i, s)))} fill="#c0674a" fillOpacity={0.25} stroke="#c0674a" strokeWidth={2.5} />
        {PILLARS.map((p, i) => {
          const ptIcon = labelPoint(i, 1.18);
          const ptLabel = labelPoint(i, 1.45);
          return (
            <g key={p.key}>
              <text x={ptIcon.x} y={ptIcon.y} fontSize={14} textAnchor="middle" dominantBaseline="middle">{p.icon}</text>
              <text x={ptLabel.x} y={ptLabel.y + (i===0?-8:i===2||i===3?15:0)} fontSize={9} fontWeight={900} fill={p.color} textAnchor="middle" dominantBaseline="middle" style={{ textTransform: 'uppercase' }}>{p.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Spark Trend Lines ────────────────────────────────────────────────────────

function SparkLine({ data, pData, cData, color }: { data: number[], pData: number[], cData: number[], color: string }) {
  const w = 90, h = 30;
  const all = [...data, ...pData, ...cData];
  const min = Math.min(...all), max = Math.max(...all);
  const getPts = (d: number[]) => d.map((v, i) => `${(i / (d.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h * 0.8 - h * 0.1}`).join(" ");
  
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* Shaded Area for Gap */}
      <polygon points={`0,${h} ${getPts(pData)} ${w},${h} 0,${h}`} fill="#3d6b8f" opacity={0.05} />
      <polygon points={`0,${h} ${getPts(cData)} ${w},${h} 0,${h}`} fill="#2e8b6e" opacity={0.05} />
      
      {/* Patient Path */}
      <polyline points={getPts(pData)} fill="none" stroke="#3d6b8f" strokeWidth={1} strokeDasharray="2,1" opacity={0.4} />
      {/* Carer Path */}
      <polyline points={getPts(cData)} fill="none" stroke="#2e8b6e" strokeWidth={1} strokeDasharray="2,1" opacity={0.4} />
      
      {/* Main Weighted Path */}
      <polyline points={getPts(data)} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / (max - min || 1)) * h * 0.8 - h * 0.1} r={2.5} fill={color} />
    </svg>
  );
}

// ── Page 1: Overall Analysis ─────────────────────────────────────────────────

function Page1() {
  return (
    <PageShell pageNum={1}>
      <ReportHeader subtitle="Overall Symptom Analysis — Multi-Source View" />

      {/* Stat strip updated with Log Breakdown */}
      <div style={{
        display: "flex", margin: "20px 40px 0",
        background: "#f8f6f1", borderRadius: 12, border: "1.5px solid #e8e4dc",
        overflow: "hidden",
      }}>
        {[
          { label: "Patient Logs", value: PATIENT_LOGS, color: "#3d6b8f" },
          { label: "Carer Logs", value: CARER_LOGS, color: "#2e8b6e" },
          { label: "Perception Gap", value: "Moderate", color: "#c0674a" },
          { label: "Alignment", value: "68%", color: "#2e8b6e" },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            flex: 1, textAlign: "center", padding: "12px 8px",
            borderRight: i < arr.length - 1 ? "1px solid #e8e4dc" : "none",
          }}>
            <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ margin: "20px 40px 0" }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#1a1a2e", marginBottom: 4 }}>Overall Symptom Burden by Pillar</div>
        <div style={{ fontSize: 11, color: "#999", marginBottom: 24 }}>Percentage contribution of each pillar to total symptom load since {PATIENT.diagnosisDate}.</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 30 }}>
           <div style={{ flex: '0 0 200px' }}>
             <DonutChart />
           </div>
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {PILLARS.map(p => {
                const pct = (PILLAR_PERCENT as any)[p.key];
                const avg = (OVERALL_PILLAR_AVG as any)[p.key];
                return (
                  <div key={p.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{p.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#1a1a2e' }}>{p.label}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 900 }}>
                        <span style={{ color: p.color }}>{pct}%</span>
                        <span style={{ color: '#bbb', marginLeft: 10, fontSize: 11, fontWeight: 600 }}>avg {avg}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: '#f8f6f1', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct * 1.5}%`, background: p.color, borderRadius: 10 }} />
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      <div style={{ margin: "0 40px 0" }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#1a1a2e", marginBottom: 14 }}>6-Month Trend per Pillar</div>
        <div style={{ background: "#fff", border: "1.5px solid #e8e4dc", borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            display: "flex", background: "#f8f6f1", padding: "8px 16px",
            borderBottom: "1px solid #e8e4dc", fontSize: 10, color: "#999",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
          }}>
            <span style={{ flex: "0 0 130px" }}>Pillar</span>
            {MONTHS.map(m => <span key={m} style={{ flex: 1, textAlign: "center" }}>{m}</span>)}
            <span style={{ flex: "0 0 100px", textAlign: "center" }}>P vs C Gap</span>
          </div>
          {PILLARS.map((p, i) => {
            const trend = (MONTHLY_TREND as any)[p.key];
            const pTrend = (PATIENT_MONTHLY_TREND as any)[p.key];
            const cTrend = (CARER_MONTHLY_TREND as any)[p.key];
            return (
              <div key={p.key} style={{
                display: "flex", alignItems: "center", padding: "10px 16px",
                borderBottom: i < PILLARS.length - 1 ? "1px solid #f0ece6" : "none",
                background: i % 2 === 0 ? "#fff" : "#fdfcfa",
              }}>
                <span style={{ flex: "0 0 130px", fontSize: 12, fontWeight: 700, color: p.color }}>{p.icon} {p.label}</span>
                {trend.map((v: number, j: number) => (
                  <span key={j} style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 600, color: "#444" }}>{v}</span>
                ))}
                <span style={{ flex: "0 0 100px", display: "flex", justifyContent: "center" }}>
                  <SparkLine data={trend} pData={pTrend} cData={cTrend} color={p.color} />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights updated with source-specific patterns */}
      <div style={{ margin: "20px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>AI Insights — Perception & Alignment</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {OVERALL_INSIGHTS.map((ins, i) => (
            <div key={i} style={{ background: ins.bg, borderLeft: `4px solid ${ins.color}`, borderRadius: 10, padding: "11px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 15 }}>{ins.icon}</span>
                <div>
                  <div style={{ fontSize: 8, color: ins.color, textTransform: "uppercase", letterSpacing: 2, fontWeight: 800 }}>{ins.pillar} · {ins.type}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#1a1a2e" }}>{ins.title}</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 10.5, color: "#555", lineHeight: 1.6, paddingLeft: 22 }}>{ins.body}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ── Page 2: Comparison + Source Breakdown ──────────────────────────────────

function Page2() {
  const totA = overallTotal(SCORES_A), totB = overallTotal(SCORES_B);
  const diff = totB - totA;
  return (
    <PageShell pageNum={2}>
      <ReportHeader subtitle={`Single Day Analysis`} />

      {/* High-Fidelity Comparison Header */}
      <div style={{
        display: 'flex', margin: "20px 40px 0", background: '#f8f6f1',
        border: '1px solid #e8e4dc', borderRadius: 20, overflow: 'hidden',
        marginBottom: 28, marginTop: 20
      }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '16px 10px', borderRight: '1px solid #e8e4dc' }}>
          <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 4 }}>{DATE_A}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>{COMPARISON_DATA.totalA}</div>
          <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{COMPARISON_DATA.logsCountA} log</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '16px 10px', borderRight: '1px solid #e8e4dc' }}>
          <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>CHANGE</div>
          <div style={{
            display: 'inline-block', padding: '8px 18px', borderRadius: 30,
            border: `2px solid ${COMPARISON_DATA.overallChange > 0 ? '#c0674a' : '#22c55e'}`,
            fontSize: 14, fontWeight: 800, color: COMPARISON_DATA.overallChange > 0 ? '#c0674a' : '#22c55e'
          }}>
            {COMPARISON_DATA.overallChange > 0 ? '▲ WORSENED' : '▼ IMPROVED'} {Math.abs(COMPARISON_DATA.overallChange)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '16px 10px' }}>
          <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 4 }}>{DATE_B}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#c0674a', lineHeight: 1 }}>{COMPARISON_DATA.totalB}</div>
          <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{COMPARISON_DATA.logsCountB} log</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 30, margin: "0 40px 28px" }}>
        <div style={{ flex: '0 0 220px' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>PILLAR OVERVIEW</div>
          <PillarRadar scoresA={SCORES_A} scoresB={SCORES_B} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff5f2', border: '1px solid #f0c4b4', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#c0674a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>▲ BIGGEST WORSENING</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a2e', marginBottom: 4 }}>{COMPARISON_DATA.biggestWorsening.label}</div>
            <div style={{ fontSize: 11, color: '#666' }}>Score rose from <strong>{COMPARISON_DATA.biggestWorsening.scoreA}</strong> → <strong>{COMPARISON_DATA.biggestWorsening.scoreB}</strong></div>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>✓ MOST IMPROVED</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a2e', marginBottom: 4 }}>{COMPARISON_DATA.biggestImprovement.label}</div>
            <div style={{ fontSize: 11, color: '#666' }}>Score dropped from <strong>{COMPARISON_DATA.biggestImprovement.scoreA}</strong> → <strong>{COMPARISON_DATA.biggestImprovement.scoreB}</strong></div>
          </div>
        </div>
      </div>

      {/* Pillar breakdown with P vs C markers */}
      <div style={{ margin: "20px 40px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>Multi-Source Breakdown by Pillar</div>
          <div style={{ display: "flex", gap: 14, fontSize: 10, color: "#888" }}>
             <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3d6b8f" }} /> Patient</span>
             <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "#2e8b6e" }} /> Carer</span>
          </div>
        </div>
        
        {PILLARS.map(pillar => {
          const avgA_P = pillarAvg(pillar, SCORES_A_P);
          const avgA_C = pillarAvg(pillar, SCORES_A_C);
          const avgB_P = pillarAvg(pillar, SCORES_B_P);
          const avgB_C = pillarAvg(pillar, SCORES_B_C);
          const pd = +( (avgB_P+avgB_C)/2 - (avgA_P+avgA_C)/2 ).toFixed(1);

          return (
            <div key={pillar.key} style={{ marginBottom: 12, background: pillar.light, borderRadius: 10, border: `1px solid ${pillar.border}`, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: `1px solid ${pillar.border}50` }}>
                <span style={{ fontSize: 15 }}>{pillar.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: pillar.color, flex: 1 }}>{pillar.label}</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 9px", borderRadius: 20, background: pd > 0 ? "#fde8e4" : "#e4f5ed", color: pd > 0 ? "#c0674a" : "#2e8b6e" }}>
                   {pd > 0 ? `▲ +${pd}` : `▼ ${pd}`} Avg Improvement
                </span>
              </div>
              <div style={{ padding: "10px 14px" }}>
                {pillar.symptoms.map(s => {
                  const pA = (SCORES_A_P as any)[s.key], cA = (SCORES_A_C as any)[s.key];
                  const pB = (SCORES_B_P as any)[s.key], cB = (SCORES_B_C as any)[s.key];
                  return (
                    <div key={s.key} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 4 }}>
                        <span style={{ color: "#555", fontWeight: 700 }}>{s.label}</span>
                        <span style={{ color: "#888" }}>{DATE_A} <span style={{ color: "#3d6b8f" }}>{pA}</span>|<span style={{ color: "#2e8b6e" }}>{cA}</span> → {DATE_B} <span style={{ color: "#3d6b8f" }}>{pB}</span>|<span style={{ color: "#2e8b6e" }}>{cB}</span></span>
                      </div>
                      <div style={{ display: "flex", gap: 40 }}>
                        {/* Date A Bar */}
                        <div style={{ flex: 1, height: 6, background: "#e8e4dc", borderRadius: 3, position: "relative" }}>
                           <div style={{ position: "absolute", left: 0, height: "100%", width: `${((pA+cA)/2)*10}%`, background: "#3d6b8f", opacity: 0.2, borderRadius: 3 }} />
                           {/* Patient Marker */}
                           <div style={{ position: "absolute", left: `${pA*10}%`, top: -3, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "2px solid #3d6b8f", transform: "translateX(-50%)", zIndex: 2 }} title="Patient" />
                           {/* Carer Marker */}
                           <div style={{ position: "absolute", left: `${cA*10}%`, top: -3, width: 10, height: 10, background: "#fff", border: "2px solid #2e8b6e", transform: "translateX(-50%)", zIndex: 1 }} title="Carer" />
                        </div>
                        {/* Date B Bar */}
                        <div style={{ flex: 1, height: 6, background: "#e8e4dc", borderRadius: 3, position: "relative" }}>
                           <div style={{ position: "absolute", left: 0, height: "100%", width: `${((pB+cB)/2)*10}%`, background: "#c0674a", opacity: 0.2, borderRadius: 3 }} />
                           <div style={{ position: "absolute", left: `${pB*10}%`, top: -3, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "2px solid #c0674a", transform: "translateX(-50%)", zIndex: 2 }} />
                           <div style={{ position: "absolute", left: `${cB*10}%`, top: -3, width: 10, height: 10, background: "#fff", border: "2px solid #2e8b6e", transform: "translateX(-50%)", zIndex: 1 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

// ── Page 3: Comparison AI ───────────────────────────────────────────────────

function Page3() {
  return (
    <PageShell pageNum={3}>
      <div style={{ background: "#1a1a2e", padding: "22px 40px", color: "#fff" }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", opacity: 0.5 }}>CTE Health Monitor</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>AI Insights — Perception Alignment</div>
          <div style={{ fontSize: 11, opacity: 0.5 }}>{DATE_A} vs {DATE_B} · Source Comparison Analysis</div>
      </div>

      <div style={{ padding: "18px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {AI_INSIGHTS.map((ins, i) => (
            <div key={i} style={{ background: ins.bg, borderLeft: `4px solid ${ins.color}`, borderRadius: 10, padding: "12px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 16 }}>{ins.icon}</span>
                <div>
                   <div style={{ fontSize: 8, color: ins.color, textTransform: "uppercase", fontWeight: 800 }}>{ins.type}</div>
                   <div style={{ fontSize: 11.5, fontWeight: 800, color: "#1a1a2e" }}>{ins.title}</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 10.5, color: "#444", lineHeight: 1.6, paddingLeft: 22 }}>{ins.body}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "#f8f6f1", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <span>🩺</span>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Discussion Points for Care Team</div>
          </div>
          {CARE_TEAM_POINTS.map((pt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "#555", marginBottom: 6 }}>
              <span style={{ fontWeight: 800, color: "#c0674a" }}>{i+1}.</span> {pt}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function CTEFullReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!reportRef.current || isGenerating) return;
    setIsGenerating(true);
    setStatus("Analyzing data...");
    
    setTimeout(async () => {
      try {
        setStatus("Creating PDF...");
        await generatePdfFromElement(reportRef.current!, "CTE-Full-Report.pdf", setStatus);
        setStatus("Complete");
        setTimeout(() => setStatus(""), 3000);
      } catch (err) {
        console.error(err);
        setStatus("Error");
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
  };

  return (
    <div style={{ background: "#ccc8c0", minHeight: "100vh", padding: "32px 0", position: "relative" }}>
      {/* Fixed UI controls - Matching Production Structure */}
      <div style={{ position: "fixed", top: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
            background: "linear-gradient(135deg, #3d6b8f 0%, #0A4B75 100%)", 
            color: "white", border: "none", borderRadius: "12px",
            fontSize: "14px", fontWeight: 700, cursor: isGenerating ? "wait" : "pointer",
            boxShadow: "0 10px 25px rgba(10, 75, 117, 0.3)", transition: "all 0.2s",
            opacity: isGenerating ? 0.8 : 1
          }}
          className="active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} />
              <span>{status || "Exporting..."}</span>
            </>
          ) : (
            <>
              <span>Export Report</span>
              <Download size={16} />
            </>
          )}
        </button>
        
        {status && !isGenerating && (
           <div style={{ 
             background: status === "Complete" ? "#e4f5ed" : "#fdf1ed",
             color: status === "Complete" ? "#2e8b6e" : "#c0674a",
             padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800,
             boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "1px solid currentColor"
           }}>
             {status === "Complete" ? "✓ Report Ready" : "✕ Error Generating"}
           </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 834, margin: "0 auto 20px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800 }}>Source-Categorized Health Report</h1>
          <p style={{ fontSize: 12, color: "#666" }}>Differentiating between Patient-reported and Carer-reported symptom severity</p>
      </div>
      <div ref={reportRef} style={{ maxWidth: 834, margin: "0 auto", padding: "0 20px" }}>
        <div className="report-page"><Page1 /></div>
        <div className="report-page"><Page2 /></div>
        <div className="report-page"><Page3 /></div>
      </div>
    </div>
  );
}
