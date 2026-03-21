import React from "react";
import { PageShell } from "./PageShell";
import { Clock, ChevronRight } from "lucide-react";
import { ReportData } from "../../types/report";
import { CarePlanPageProps } from "../../types/props";
import { TITLE_CARE_PLAN_POINTS, SUBTITLE_CARE_PLAN } from "../../constants/report";

export const CarePlanPage: React.FC<CarePlanPageProps> = ({ data }) => {
  const { patient, ai } = data;

  return (
    <PageShell pageNum={4} totalPages={5} patientName={patient.name} patientId={patient.id}>
      <div className="pro-header" style={{
        background: '#1a1a2e',
        padding: '24px 40px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 15
      }}>
        <Clock size={28} color="#5fa8d3" />
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{TITLE_CARE_PLAN_POINTS}</h2>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            {SUBTITLE_CARE_PLAN}
          </div>
        </div>
      </div>
      <main className="report-body">
        <div className="points-card" style={{ padding: '30px 40px' }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {ai.careTeamPoints.map((point: string, idx: number) => (
              <li key={idx} style={{
                display: 'flex',
                gap: 15,
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#f0f9ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ChevronRight size={14} color="#0369a1" />
                </div>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: '#ffffff', fontWeight: 500 }}>
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </PageShell>
  );
};
