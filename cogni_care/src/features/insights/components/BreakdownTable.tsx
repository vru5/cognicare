import { format } from "date-fns"
import { BreakdownTableProps } from "../types/insightsTypes"
import { 
  BREAKDOWN_TITLE, 
  getBreakdownEmoji, 
  getSymptomFullName 
} from "../constants/insightsConstants"
import { SymptomPillar } from "@/features/logs/types/logTypes"

export default function BreakdownTable({ dateA, dateB, dataA, dataB }: BreakdownTableProps) {
  const pillars: SymptomPillar[] = ["physical", "mood", "cognitive", "sleep", "social"]
  
  // Requirement: Greater date should always be shown 1st (Column 1)
  const isAGreater = dateA.getTime() >= dateB.getTime();
  
  const col1Date = isAGreater ? dateA : dateB;
  const col2Date = isAGreater ? dateB : dateA;
  const col1Data = isAGreater ? dataA : dataB;
  const col2Data = isAGreater ? dataB : dataA;
  
  // Column colors stay synced with the original cards: Date A = Blue, Date B = Orange
  const col1Color = isAGreater ? "#2A5174" : "#C46747"; 
  const col2Color = isAGreater ? "#C46747" : "#2A5174";

  const getEmoji = (p: string) => getBreakdownEmoji(p);
  const getLabel = (p: string) => getSymptomFullName(p);

  return (
    <div className="bg-[#eaf2fa] rounded-[2rem] shadow-sm p-6 pb-8 w-full flex flex-col">
      
      {/* Header Area */}
      <div className="flex flex-col gap-3 mb-10 w-full">
        {/* Title row */}
        <h2 className="text-4xl font-black text-[#1A202C] tracking-tight">
          {BREAKDOWN_TITLE}<span className="text-[#2A5174]">.</span>
        </h2>
        
        {/* Date legends: Column 1 (Greater) then Column 2 (Earlier) */}
        <div className="flex items-center gap-4">
          {/* Column 1 Date (Greater) */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col1Color }} />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {format(col1Date, "d MMM")}
            </span>
          </div>

          {/* Column 2 Date (Earlier) */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col2Color }} />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {format(col2Date, "d MMM")}
            </span>
          </div>
        </div>
      </div>

      {/* Rows Area */}
      <div className="flex flex-col gap-6 w-full px-2">
        {pillars.map(p => {
          const val1 = col1Data ? col1Data[p] || 0 : 0;
          const val2 = col2Data ? col2Data[p] || 0 : 0;
          
          // Delta is always (Latest - Previous) which is (Col 1 - Col 2)
          const diff = val1 - val2;
          
          return (
            <div key={p} className="flex items-center justify-between w-full">
              
              {/* Left: Emoji + Label */}
              <div className="flex items-center gap-4 w-28 sm:w-32">
                <span className="text-2xl drop-shadow-sm">{getEmoji(p)}</span>
                <span className="text-slate-600 font-bold text-sm sm:text-base">{getLabel(p)}</span>
              </div>
              
              {/* Right: 3 Columns (Val 1, Val 2, Diff) */}
              <div className="flex items-center gap-8 sm:gap-12 justify-end w-full">
                {/* Column 1 (Greater Date) - Color synced with Card */}
                <span className="font-black text-lg w-6 text-center text-clip overflow-hidden" style={{ color: col1Color }}>
                  {val1 > 0 ? val1 : '—'}
                </span>
                
                {/* Column 2 (Earlier Date) - Color synced with Card */}
                <span className="font-black text-lg w-6 text-center text-clip overflow-hidden" style={{ color: col2Color }}>
                  {val2 > 0 ? val2 : '—'}
                </span>
                
                {/* Difference (Positive=Green, Negative=Red) */}
                <span className={`w-8 text-right font-black text-sm ${diff > 0 ? 'text-[#22c55e]' : diff < 0 ? 'text-[#ef4444]' : 'text-slate-300'}`}>
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
