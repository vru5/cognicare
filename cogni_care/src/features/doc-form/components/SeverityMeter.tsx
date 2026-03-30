import React from "react";
import { TesData, SymptomCheck, HistoryData, SeverityMeterProps } from "../types/docForm";
import { SeverityGauge } from "./SeverityGauge";

export const SeverityMeter: React.FC<SeverityMeterProps> = ({ tes, symptomChecks, history, aiHistoryGrade }) => {
  const presentCount = Object.values(symptomChecks).filter((s) => s.present).length;
  const worseCount = Object.values(symptomChecks).filter((s) => s.worse).length;
  const improvingCount = Object.values(symptomChecks).filter((s) => s.improving).length;
  const symptomScore = Math.min(Math.round(presentCount * 0.9 + worseCount * 2 - improvingCount * 0.5), 30);

  let historyScore = 0;
  const filledHistory = Object.values(history || {}).filter((v) => typeof v === 'string' && v.trim().length > 0).length;
  historyScore += Math.min(filledHistory * 2, 8);
  if (history?.drinking?.trim().length > 2) historyScore += 3;
  if (history?.nonPrescription?.trim().length > 2) historyScore += 2;
  if (history?.stoppedChores?.trim().length > 2) historyScore += 2;
  historyScore = Math.min(Math.round(historyScore), 15);

  const rhiMet = [tes.rhi_concussions4, tes.rhi_moderate2, tes.rhi_sports6, tes.rhi_military, tes.rhi_other].filter(Boolean).length;
  const coreMet = [tes.core_cognitive, tes.core_behavioral, tes.core_mood].filter(Boolean).length;
  const supMet = [tes.sup_decline, tes.sup_delayed, tes.sup_impulsivity, tes.sup_anxiety, tes.sup_apathy, tes.sup_paranoia, tes.sup_suicidality, tes.sup_headache, tes.sup_motor].filter(Boolean).length;
  const tesScore = Math.min(Math.round(rhiMet * 5 + coreMet * 9 + Math.min(supMet * 4, 20) + (tes.symptoms_12months ? 8 : 0)), 55);

  const historyFinalScore = aiHistoryGrade !== null && aiHistoryGrade !== undefined ? aiHistoryGrade : historyScore;
  const totalScore = Math.min(symptomScore + historyFinalScore + tesScore, 100);

  let level, levelCol, urgency;
  if (totalScore >= 75) {
    level = "High"; levelCol = "text-[#c96d54]";
    urgency = "Requires urgent clinical attention. Multiple TES criteria confirmed.";
  } else if (totalScore >= 50) {
    level = "Moderate"; levelCol = "text-[#e5b05c]";
    urgency = "Significant burden across symptoms and TES. Specialist referral recommended.";
  } else if (totalScore >= 25) {
    level = "Mild"; levelCol = "text-[#4a6b82]";
    urgency = "Some criteria met. Complete all sections for accuracy.";
  } else {
    level = "Low"; levelCol = "text-[#51947b]";
    urgency = "Low severity indicated. Continue monitoring symptoms.";
  }

  const sources = [
    { label: "Symptoms", score: symptomScore, max: 30, color: "#4a6b82", desc: `${presentCount} present, ${worseCount} worsening` },
    { 
      label: "History", 
      score: historyFinalScore, 
      max: 15, 
      color: "#e5b05c", 
      desc: aiHistoryGrade !== null ? "✦ AI Evaluated Content" : `${filledHistory}/7 fields` 
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
        <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-slate-500">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#51947b]"></span> Low
        </div>
        <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-slate-500">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#4a6b82]"></span> Mild
        </div>
        <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-slate-500">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#e5b05c]"></span> Moderate
        </div>
        <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-slate-500">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#c96d54]"></span> High
        </div>
      </div>
    </div>
  );
};
