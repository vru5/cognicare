import React from "react";

import { SparkLineProps } from "../../../types/props";

export const SparkLine: React.FC<SparkLineProps> = ({ trend, color }) => {
  const validPts = trend.map((v, i) => ({ v, i })).filter(pt => pt.v != null);
  const w = 90, h = 30;
  
  // Dynamic scaling to make spikes more visible
  const values = validPts.map(pt => pt.v!);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const range = dataMax - dataMin;
  
  // Use a min/max with buffer, or fallback to 0-10 if data is too flat
  const min = range < 1 ? Math.max(0, dataMin - 1) : dataMin - range * 0.1;
  const max = range < 1 ? Math.min(10, dataMax + 1) : dataMax + range * 0.1;

  if (validPts.length === 1) {
    const { v } = validPts[0];
    const cx = w / 2;
    const cy = h / 2;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <circle cx={cx} cy={cy} r={4} fill={color} opacity={0.8} />
        <text 
          x={cx + 8} 
          y={cy + 4} 
          fontSize="10" 
          fill={color} 
          fontWeight="700" 
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {v!.toFixed(1)}
        </text>
      </svg>
    );
  }

  if (validPts.length < 2) {
    return <span style={{ fontSize: 10, color: '#ccc' }}>—</span>;
  }

  const ptsList = validPts.map(({ v, i }) => {
    const x = (i / (trend.length - 1)) * w;
    const y = h - ((v! - min) / (max - min)) * h * 0.8 - h * 0.1;
    return { x, y };
  });

  const pathData = ptsList.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(" ");
  const lastPt = ptsList[ptsList.length - 1];
  
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <path d={pathData} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={0.8} />
      <circle cx={lastPt.x} cy={lastPt.y} r={3} fill={color} />
    </svg>
  );
};
