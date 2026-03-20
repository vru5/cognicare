"use client"
import { format } from "date-fns"
import { DailyAverage } from "../types/insightsTypes"

interface BreakdownTableProps {
  dateA: Date;
  dateB: Date;
  dataA: DailyAverage | null;
  dataB: DailyAverage | null;
}

import { SymptomPillar } from "@/features/logs/types/logTypes"

export default function BreakdownTable({ dateA, dateB, dataA, dataB }: BreakdownTableProps) {
  const pillars: SymptomPillar[] = ["physical", "mood", "cognitive", "sleep", "social"]
  
  const getEmoji = (p: string) => {
    switch(p) {
      case "physical": return "🤕"
      case "mood": return "😔"
      case "cognitive": return "🧠"
      case "sleep": return "😴"
      case "social": return "💬"
      default: return "📌"
    }
  }
  
  const getLabel = (p: string) => p.charAt(0).toUpperCase() + p.substring(1)

  return (
    <div className="bg-[#eaf2fa] rounded-[2rem] shadow-sm p-6 pb-8 w-full flex flex-col">
      
      {/* Header Area */}
      <div className="flex flex-col gap-3 mb-10 w-full">
        {/* Title row */}
        <h2 className="text-4xl font-black text-[#1A202C] tracking-tight">
          Breakdown<span className="text-[#2A5174]">.</span>
        </h2>
        
        {/* Date legends on the next line */}
        <div className="flex items-center gap-4">
          {/* Date A */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#2A5174]" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {format(dateA, "d MMM")}
            </span>
          </div>

          {/* Date B */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#C46747]" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {format(dateB, "d MMM")}
            </span>
          </div>
        </div>
      </div>

      {/* Rows Area */}
      <div className="flex flex-col gap-6 w-full px-2">
        {pillars.map(p => {
          const valA = dataA ? dataA[p] || 0 : 0;
          const valB = dataB ? dataB[p] || 0 : 0;
          const diff = valB - valA;
          
          return (
            <div key={p} className="flex items-center justify-between w-full">
              
              {/* Left: Emoji + Label */}
              <div className="flex items-center gap-4 w-28 sm:w-32">
                <span className="text-2xl drop-shadow-sm">{getEmoji(p)}</span>
                <span className="text-slate-600 font-bold text-sm sm:text-base">{getLabel(p)}</span>
              </div>
              
              {/* Right: 3 Columns (Val A, Val B, Diff) */}
              <div className="flex items-center gap-8 sm:gap-12 justify-end w-full">
                {/* Value A (Dark Blue) */}
                <span className="text-[#2A5174] font-black text-lg w-6 text-center">
                  {valA > 0 ? valA : '—'}
                </span>
                
                {/* Value B (Coral) */}
                <span className="text-[#C46747] font-black text-lg w-6 text-center">
                  {valB > 0 ? valB : '—'}
                </span>
                
                {/* Difference (Green/Red/Grey) */}
                <span className={`w-6 text-right font-black text-sm ${diff > 0 ? 'text-[#ef4444]' : diff < 0 ? 'text-[#22c55e]' : 'text-slate-300'}`}>
                  {diff > 0 ? `+${diff}` : diff < 0 ? diff : '—'}
                </span>
              </div>
              
            </div>
          )
        })}
      </div>

    </div>
  )
}
