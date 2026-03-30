import React from "react";
import { SeverityMeterProps } from "../types/docForm";
import { SeverityGauge } from "./SeverityGauge";
import { calculateSeverityScore } from "../utils/scoring";
import { SEVERITY_LEVELS } from "../constants/docFormConfig";

export const SeverityMeter: React.FC<SeverityMeterProps> = ({ tes, symptomChecks, history, aiHistoryGrade }) => {
  const scores = calculateSeverityScore(symptomChecks, history, tes, aiHistoryGrade);
  const { total: totalScore, symptomScore, historyScore: historyFinalScore, tesScore } = scores;
  const { presentCount, worseCount, rhiMet, coreMet, supMet } = scores;

  // Determine current severity level based on score
  const currentLevel = [...SEVERITY_LEVELS].reverse().find(l => totalScore >= l.minScore) || SEVERITY_LEVELS[0];
  const { label: level, textColorClass: levelCol, urgency } = currentLevel;

  const sources = [
    { label: "Symptoms", score: symptomScore, max: 30, color: "#4a6b82", desc: `${presentCount} present, ${worseCount} worsening` },
    { 
      label: "History", 
      score: historyFinalScore, 
      max: 15, 
      color: "#e5b05c", 
      desc: aiHistoryGrade !== null && aiHistoryGrade !== undefined ? "✦ AI Evaluated Content" : "Manual Assessment" 
    },
    { label: "TES", score: tesScore, max: 55, color: "#c96d54", desc: `RHI:${rhiMet} Core:${coreMet} Sup:${supMet}` },
  ];

  const outerWidth = 260;
  const cx = outerWidth / 2;
  const cy = 130; 
  const outerR = 120;
  const innerR = 75;

  return (
    <div className="mt-4 rounded-[24px] border border-slate-200 bg-[#f4f7f9] p-8 shadow-sm font-serif">
      <div className="mb-10">
        <h3 className="text-[17px] font-bold flex items-center gap-2 mb-1 text-slate-800 tracking-tight">🎯 Overall Severity Score</h3>
        <p className="text-[14px] text-slate-400 font-sans font-medium">Symptoms + History + TES criteria</p>
      </div>

      <div className="flex flex-col items-center mb-8 pt-4">
        <div className="w-[280px] h-[140px]">
          <SeverityGauge score={totalScore} />
        </div>

        <div className={`text-[22px] font-bold mt-2 tracking-wide ${levelCol}`}>{level}</div>
        <p className="text-[15px] text-slate-500 mt-2 text-center max-w-sm">{urgency}</p>
      </div>

      <div className="space-y-6 pt-6 -mx-2 px-2 border-t border-slate-200/80">
        {sources.map(src => (
          <div key={src.label}>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[16px] font-bold text-slate-800/90">{src.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[16px] font-bold text-slate-800`} style={{ color: src.color }}>
                  {src.score} <span className="text-[13px] text-slate-400 font-medium ml-0.5">/{src.max}</span>
                </span>
              </div>
            </div>
            <div className="h-3.5 bg-[#ebe6e0] rounded-full overflow-hidden leading-none">
              <div className="h-full rounded-full transition-all duration-700 shadow-sm" style={{ width: `${(src.score / src.max) * 100}%`, backgroundColor: src.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-10 pt-4 px-2">
        {SEVERITY_LEVELS.map(level => (
          <div key={level.id} className="flex items-center gap-2 text-[13px] font-sans font-medium text-slate-500">
            <span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: level.color }}></span> {level.label}
          </div>
        ))}
      </div>
    </div>
  );
};
