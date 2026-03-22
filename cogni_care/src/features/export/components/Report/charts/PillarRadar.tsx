import React from "react";
import { PILLARS_CONFIG } from "../../../constants/pillars";
import { PillarConfig } from "../../../types/report";
import { PillarRadarProps } from "../../../types/props";

export const PillarRadar: React.FC<PillarRadarProps> = ({ scoresA, scoresB }) => {
  const cx = 130; 
  const cy = 130;
  const r = 70;
  const totalPillars = PILLARS_CONFIG.length;

  const point = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / totalPillars - Math.PI / 2;
    return {
      x: cx + r * val * Math.cos(angle),
      y: cy + r * val * Math.sin(angle)
    };
  };

  const labelPoint = (i: number, dist: number) => {
    const angle = (Math.PI * 2 * i) / totalPillars - Math.PI / 2;
    return {
      x: cx + r * dist * Math.cos(angle),
      y: cy + r * dist * Math.sin(angle)
    };
  };

  const toPath = (pts: {x: number, y: number}[]) => 
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
    
  const grid = [0.25, 0.5, 0.75, 1.0];
  const scaleA = PILLARS_CONFIG.map((p: PillarConfig) => (scoresA[p.key] || 0) / 10);
  const scaleB = PILLARS_CONFIG.map((p: PillarConfig) => (scoresB[p.key] || 0) / 10);
  
  return (
    <div style={{ width: 260, height: 260, margin: '0 auto' }}>
      <svg width="100%" height="100%" viewBox="0 0 260 260">
        {grid.map((g: number) => (
          <polygon 
            key={g} 
            points={PILLARS_CONFIG.map((_: PillarConfig, i: number) => { const p = point(i, g); return `${p.x},${p.y}`; }).join(" ")} 
            fill="none" 
            stroke="#e0dcd6" 
            strokeWidth={0.7} 
            strokeDasharray="2,2"
          />
        ))}
        {PILLARS_CONFIG.map((_: PillarConfig, i: number) => { 
          const p = point(i, 1); 
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e0dcd6" strokeWidth={0.7} />; 
        })}
        
        <path d={toPath(scaleA.map((s: number, i: number) => point(i, s)))} fill="#3d6b8f" fillOpacity={0.15} stroke="#3d6b8f" strokeWidth={1.5} />
        <path d={toPath(scaleB.map((s: number, i: number) => point(i, s)))} fill="#c0674a" fillOpacity={0.25} stroke="#c0674a" strokeWidth={2.5} />
        
        {PILLARS_CONFIG.map((p: PillarConfig, i: number) => {
          // Precise positioning
          const ptIcon = labelPoint(i, 1.18);
          const ptLabel = labelPoint(i, 1.45);
          
          let yOff = 0;
          let xOff = 0;
          
          // Mood (Top)
          if (i === 0) yOff = -15;
          // Physical (Right-ish)
          if (i === 1) { xOff = 12; yOff = 5; }
          // Cognitive (Bottom Right)
          if (i === 2) { xOff = 10; yOff = 20; }
          // Social (Bottom Left)
          if (i === 3) { xOff = -10; yOff = 20; }
          // Sleep (Left-ish)
          if (i === 4) { xOff = -12; yOff = 5; }

          return (
            <g key={p.key}>
              <text 
                x={ptIcon.x} 
                y={ptIcon.y} 
                fontSize={14} 
                textAnchor="middle" 
                dominantBaseline="middle"
              >
                {p.icon}
              </text>
              <text 
                x={ptLabel.x + xOff} 
                y={ptLabel.y + yOff} 
                fontSize={9} 
                fontWeight={900} 
                fill={p.color} 
                textAnchor="middle" 
                dominantBaseline="middle"
                style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
