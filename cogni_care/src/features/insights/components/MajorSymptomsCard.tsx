"use client"

import { MajorSymptom, InsightAlert } from "../types/insightsTypes"
import { AlertTriangle, TrendingUp, Activity, Brain, Moon, Users, User } from "lucide-react"
import InsightsCard from "@/components/shared/InsightsCard"
import { format } from "date-fns"

interface MajorSymptomsCardProps {
  alerts: InsightAlert[];
}

export default function MajorSymptomsCard({ alerts }: MajorSymptomsCardProps) {
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-top duration-700">
      {/* Red Alert Section */}
      {alerts.length > 0 && (
        <div className="relative overflow-hidden bg-red-50 border-2 border-red-500/20 rounded-[2rem] p-6 shadow-xl shadow-red-500/5 group transition-all hover:shadow-red-500/10">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="w-24 h-24 text-red-600" />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/40 animate-pulse">
              <AlertTriangle className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-900 tracking-tight">Critical Attention Required</h3>
              <p className="text-red-700/70 text-sm font-bold">High-risk indicators detected in logs</p>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 10).map((alert, idx) => (
              <div key={idx} className="flex flex-col bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-red-200/50 shadow-sm">
                <p className="text-red-800 font-bold text-sm leading-relaxed">{alert.message}</p>
                <p className="text-red-600/50 text-[10px] font-black uppercase tracking-wider mt-2">
                  Detected on {format(new Date(alert.date), 'MMM d, h:mm a')}
                </p>
              </div>
            ))}
            {alerts.length > 10 && (
              <p className="text-center text-red-500 text-[11px] font-black italic mt-2">
                + {alerts.length - 10} more critical alerts
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
