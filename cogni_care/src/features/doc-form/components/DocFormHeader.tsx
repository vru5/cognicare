import React from "react";
import { format } from "date-fns";

import { DocFormHeaderProps } from "../types/docForm";

export const DocFormHeader: React.FC<DocFormHeaderProps> = ({ title, patient }) => {
  const hasAge = patient?.age && patient.age !== "0" && patient.age !== 0;
  
  return (
    <header style={{ 
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)", 
      padding: "28px 40px", 
      color: "#fff", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center" 
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 8, 
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", 
            display: "flex", alignItems: "center", justifyContent: "center" 
          }}>
            <img src="/images/cogni-care-logo.svg" alt="Logo" style={{ width: 18, height: 18, objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>CTE Health Monitor</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: -1 }}>{title}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
          {patient?.name || "Patient"} · {patient?.id || "N/A"}
          {hasAge && <> · Age {patient.age}</>}
          {patient?.consultant && <> · Consultant: {patient.consultant}</>}
        </div>
      </div>
      
      <div style={{ 
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", 
        borderRadius: 12, padding: "10px 18px", textAlign: "right", minWidth: 140 
      }}>
        <div style={{ fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>Date of Evaluation</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#5fa8d3", marginTop: 2 }}>{patient?.evaluationDate || format(new Date(), "dd/MM/yyyy")}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{patient?.monthsSinceFirst || 0} months since logs</div>
      </div>
    </header>
  );
};
