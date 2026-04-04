"use client"

import { MajorSymptom, InsightAlert, MajorSymptomsCardProps } from "../types/insightsTypes"
import { AlertTriangle, TrendingUp, Activity, Brain, Moon, Users, User } from "lucide-react"
import InsightsCard from "@/components/shared/InsightsCard"
import { format } from "date-fns"
import { getPillarColor } from "../constants/insightsConstants"

export default function MajorSymptomsCard({ alerts, symptoms, accentColor, onHelpClick }: MajorSymptomsCardProps) {
  // Use specific icons based on pillar
  const getPillarIcon = (pillar: string) => {
    switch (pillar.toLowerCase()) {
      case 'physical': return <Activity className="w-5 h-5" />;
      case 'mood': return <TrendingUp className="w-5 h-5" />;
      case 'cognitive': return <Brain className="w-5 h-5" />;
      case 'sleep': return <Moon className="w-5 h-5" />;
      case 'social': return <Users className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  // Ensure exactly 5 symptoms are shown for layout consistency
  const displaySymptoms = [...symptoms].slice(0, 5);
  const placeholdersNeeded = 5 - displaySymptoms.length;
  
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-top duration-700">
      {/* Red Alert Section - High Priority (Today Only) */}
      {alerts.length > 0 && (
        <div className="relative overflow-hidden bg-red-50 border-2 border-red-500/20 rounded-3xl p-6 shadow-xl shadow-red-500/5 group transition-all hover:shadow-red-500/10">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="w-24 h-24 text-red-600" />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/40 animate-pulse">
              <AlertTriangle className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-900 tracking-tight">Critical Attention Required</h3>
              <p className="text-red-700/70 text-sm font-bold">High-risk indicators detected today</p>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, idx) => (
              <div key={idx} className="flex flex-col bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-red-200/50 shadow-sm">
                <p className="text-red-800 font-bold text-sm leading-relaxed">{alert.message}</p>
                <p className="text-red-600/50 text-[10px] font-black uppercase tracking-wider mt-2">
                  Detected on {format(new Date(alert.date), 'MMM d, h:mm a')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Major Symptoms Section (Fixed Window) */}
      <InsightsCard 
        title="Major Symptoms" 
        subtitle="Frequent indicators from recent logs (Last 7 days)"
        accentColor={accentColor}
        onHelpClick={onHelpClick}
      >
        <div className="grid grid-cols-1 gap-3">
          {displaySymptoms.map((symptom, idx) => {
            const pillarColor = getPillarColor(symptom.pillar);
            return (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 rounded-3xl bg-sky-50 border border-sky-100 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white shadow-sm transition-colors"
                    style={{ color: pillarColor }}
                  >
                    {getPillarIcon(symptom.pillar)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-700 capitalize">{symptom.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span style={{ color: pillarColor }}>{symptom.pillar}</span> • {symptom.source}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div 
                    className="px-3 py-1 bg-white rounded-full border border-slate-100 text-[10px] font-black shadow-sm" 
                    style={{ color: pillarColor }}
                  >
                    LVL {symptom.severity}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Placeholder slots to ensure exactly 5 items are always shown */}
          {Array.from({ length: placeholdersNeeded }).map((_, idx) => (
            <div 
              key={`placeholder-${idx}`} 
              className="flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 border border-dashed border-slate-200 opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/50 shadow-inner">
                  <Activity className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-300">No recent data</h4>
                  <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">
                    Stable • N/A
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="px-3 py-1 bg-white/50 rounded-full border border-slate-100 text-[10px] font-black text-slate-200 shadow-sm">
                  LVL 0
                </div>
              </div>
            </div>
          ))}
        </div>
      </InsightsCard>
    </div>
  );
}
