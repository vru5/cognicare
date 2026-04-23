"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calculator, BarChart3, Info } from "lucide-react";
import { CALCULATION_TEXT, SEVERITY_LEGEND } from "../constants/insightsConstants";
import { CalculationModalProps } from "../types/insightsTypes";

export default function CalculationModal({ isOpen, onClose, type = "symptoms" }: CalculationModalProps) {
  const isSymptoms = type === "symptoms";
  const isPredictive = type === "predictive";
  
  let content;
  if (isSymptoms) content = CALCULATION_TEXT.SYMPTOMS;
  else if (isPredictive) content = CALCULATION_TEXT.PREDICTIVE;
  else content = CALCULATION_TEXT.AVERAGE;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-md bg-white rounded-[2rem] p-8 border-none shadow-2xl">
        <DialogHeader className="mb-6">
          <div className="flex items-center justify-center text-center">
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
              {content.TITLE}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 font-bold mt-1 text-center">
            {isPredictive ? (content as any).SUBTITLE : CALCULATION_TEXT.SYMPTOMS.SUBTITLE}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Section 1: Major Symptoms Analysis */}
          {isSymptoms && (
            <section className="space-y-6">
              <div className="bg-slate-50 rounded-[2rem] p-7 border border-slate-100">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">
                  {CALCULATION_TEXT.SYMPTOMS.LOGIC_INTRO.split(":")[0]}
                </h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  {CALCULATION_TEXT.SYMPTOMS.LOGIC_INTRO}
                </p>

                <div className="space-y-5">
                  {CALCULATION_TEXT.SYMPTOMS.RULES.map((rule) => (
                    <div key={rule.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-[10px] font-black text-primary border border-primary/10">
                        {rule.id}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 mb-1">{rule.title}</p>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed whitespace-pre-line">
                          {rule.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/50">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                    {CALCULATION_TEXT.SYMPTOMS.EXAMPLE.TITLE}
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-800">
                          Symptom: {CALCULATION_TEXT.SYMPTOMS.EXAMPLE.SYMPTOM}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold italic">
                          Logs: {CALCULATION_TEXT.SYMPTOMS.EXAMPLE.LOGS}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                          {CALCULATION_TEXT.SYMPTOMS.EXAMPLE.RESULT_LABEL}
                        </p>
                        <p className="text-lg font-black text-slate-800">
                          {CALCULATION_TEXT.SYMPTOMS.EXAMPLE.RESULT_VALUE}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Section 2: Combined Average */}
          {type === "average" && (
            <section className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {CALCULATION_TEXT.AVERAGE.LOGIC}
                </p>
                <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200/50 flex items-center justify-center shadow-sm">
                  <code className="text-[10px] font-black text-primary uppercase tracking-tighter">
                    {CALCULATION_TEXT.AVERAGE.FORMULA}
                  </code>
                </div>
                <p className="mt-4 text-xs text-slate-500 font-bold leading-relaxed">
                  {CALCULATION_TEXT.AVERAGE.FOOTER}
                </p>
              </div>
            </section>
          )}

          {/* Section 4: Predictive Analysis */}
          {isPredictive && (
            <section className="space-y-6">
              <div className="bg-slate-50 rounded-[2rem] p-7 border border-slate-100">
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  {CALCULATION_TEXT.PREDICTIVE.LOGIC}
                </p>

                <div className="space-y-5">
                  {CALCULATION_TEXT.PREDICTIVE.RULES.map((rule) => (
                    <div key={rule.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-[10px] font-black text-primary border border-primary/10">
                        {rule.id}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 mb-1">{rule.title}</p>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                          {rule.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Section 3: Legend (Major Symptoms Only) */}
          {isSymptoms && (
            <section className="bg-primary/5 rounded-[2rem] p-7 border border-primary/10">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Severity Legend</h4>
              <div className="flex items-center justify-between gap-2">
                {SEVERITY_LEGEND.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`px-3 py-1 bg-white rounded-full border text-[10px] font-black shadow-sm ${item.colorClass}`}>
                      {item.label}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Understood
        </button>
      </DialogContent>
    </Dialog>
  );
}
