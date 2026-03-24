import React from "react";

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
  const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    "L", startInner.x, startInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 0, endInner.x, endInner.y,
    "Z"
  ].join(" ");
};

export const SeverityGauge = ({ score }: { score: number }) => {
  const outerWidth = 260;
  const cx = outerWidth / 2;
  const cy = 130; 
  const outerR = 120;
  const innerR = 75;

  return (
    <svg viewBox={`0 0 ${outerWidth} ${cy + 10}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <path d={describeArc(cx, cy, innerR, outerR, 0, 45)} fill="#51947b" />
      <path d={describeArc(cx, cy, innerR, outerR, 45, 90)} fill="#4a6b82" />
      <path d={describeArc(cx, cy, innerR, outerR, 90, 135)} fill="#e5b05c" />
      <path d={describeArc(cx, cy, innerR, outerR, 135, 180)} fill="#c96d54" />
      
      {/* Needle */}
      <g style={{ transform: `rotate(${(score / 100) * 180 - 90}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <line x1={cx} y1={cy} x2={cx} y2={cy - innerR - 25} stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
      </g>
      <circle cx={cx} cy={cy} r="10" fill="#1e293b" />
      <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
      
      {/* Natively Embedded Score Text */}
      <text 
        x={cx} 
        y={cy - 20} 
        textAnchor="middle" 
        fontSize="56" 
        fontWeight="800" 
        fontFamily="'Lora', 'Georgia', serif" 
        fill="#1e293b"
      >
        {score}
      </text>
    </svg>
  );
};
