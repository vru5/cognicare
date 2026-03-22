import React from "react";
import { PILLARS_CONFIG } from "../../../constants/pillars";
import { PillarConfig } from "../../../types/report";
import { DoughnutChartProps } from "../../../types/props";

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ averages }) => {
  const total = Object.values(averages).reduce((a: number, b: number) => a + b, 0) || 1;
  const data = PILLARS_CONFIG.map((p: PillarConfig) => ({
    ...p,
    value: averages[p.key] || 0,
    percent: +((averages[p.key] || 0) / total * 100).toFixed(1)
  }));

  const radius = 80;
  const strokeWidth = 35;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Find highest pillar
  const highest = [...data].sort((a, b) => b.value - a.value)[0];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30, margin: "20px 0" }}>
      {/* Chart Column */}
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg height={200} width={200}>
          {/* Group for all segments, rotated to start at 12 o'clock */}
          <g transform="rotate(-90 100 100)">
            {/* Background circle */}
            <circle
              stroke="#f0ece6"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={100}
              cy={100}
            />
            {data.map((p, i) => {
              const segmentLength = (p.percent / 100) * circumference;
              const previousSegments = data.slice(0, i);
              const offset = previousSegments.reduce((sum, curr) => sum + (curr.percent / 100) * circumference, 0);
              
              return (
                <circle
                  key={p.key}
                  stroke={p.color}
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${segmentLength - 1.5} ${circumference}`}
                  strokeDashoffset={-offset}
                  r={normalizedRadius}
                  cx={100}
                  cy={100}
                  strokeLinecap="butt"
                />
              );
            })}
          </g>

          {/* Separate map for labels to keep them un-rotated (horizontal) */}
          {data.map((p, i) => {
            if (p.percent <= 5) return null;
            const previousSegments = data.slice(0, i);
            const offset = previousSegments.reduce((sum, curr) => sum + (curr.percent / 100) * circumference, 0);
            const segmentLength = (p.percent / 100) * circumference;
            
            // Math for labels: start at -90deg (Top) and go clockwise
            const midAngle = ((offset + segmentLength / 2) / circumference) * 2 * Math.PI - Math.PI / 2;
            const lx = 100 + normalizedRadius * Math.cos(midAngle);
            const ly = 100 + normalizedRadius * Math.sin(midAngle);

            return (
              <text
                key={p.key}
                x={lx}
                y={ly}
                fill="white"
                fontSize={10}
                fontWeight={900}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {p.percent}%
              </text>
            );
          })}
        </svg>

        {/* Center Content */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          width: '100%'
        }}>
          <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 1 }}>Highest</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: highest?.color || "#1a1a2e", lineHeight: 1 }}>{highest?.label}</div>
          <div style={{ fontSize: 14, color: "#1a1a2e", fontWeight: 900, marginTop: 2 }}>{highest?.percent}%</div>
        </div>
      </div>

      {/* List Column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 15 }}>
        {data.map((p) => (
          <div key={p.key} style={{ paddingBottom: 2 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e" }}>{p.label}</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: p.color }}>{p.percent}%</span>
                <span style={{ fontSize: 10, color: "#b3b3b3", fontWeight: 700 }}>avg {p.value.toFixed(1)}</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div style={{ height: 5, background: "#f8f6f1", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ width: `${p.percent}%`, height: "100%", background: p.color, borderRadius: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
