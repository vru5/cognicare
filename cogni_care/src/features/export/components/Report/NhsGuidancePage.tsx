import React, { memo } from "react";
import { PageShell } from "./PageShell";
import { ReportHeader } from "./ReportHeader";
import { NhsGuidancePageProps } from "../../types/props";
import { Stethoscope, ClipboardCheck, Users } from "lucide-react";
import { 
  LABEL_PERIOD, 
  TITLE_NHS_GUIDANCE, 
  SUBTITLE_CLINICAL_ALIGNMENT,
  LABEL_DIAGNOSTIC_STEPS,
  LABEL_CARERS_CORNER
} from "../../constants/report";

const NhsGuidancePageBase: React.FC<NhsGuidancePageProps> = ({ data, pageNum, totalPages }) => {
  const { patient, ai, summary, period } = data;
  const guidance = ai.nhsGuidance;

  return (
    <PageShell pageNum={pageNum} totalPages={totalPages} patientName={patient.name} patientId={patient.id}>
      <ReportHeader
        title={TITLE_NHS_GUIDANCE}
        subtitle={SUBTITLE_CLINICAL_ALIGNMENT}
        patient={patient}
        summary={summary}
        periodInfo={{ 
          label: LABEL_PERIOD, 
          value: `${period.dateA} — ${period.dateB}`,
          sub: `${period.entries} symptom logs`
        }}
      />

      <main className="report-body" style={{ padding: '0 40px' }}>
        {/* 1. Clinical Alignment Section */}
        <section style={{ marginTop: 30, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 10, background: '#f0f9ff', borderRadius: 12 }}>
              <Stethoscope size={24} color="#0369a1" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1a1a2e', margin: 0 }}>Clinical Alignment</h2>
          </div>
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 24,
            padding: '24px 32px',
            fontSize: 15,
            lineHeight: 1.8,
            color: '#334155',
            fontWeight: 500,
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
          }}>
            {guidance.clinicalAlignment}
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }}>
          {/* 2. NHS Recommended Tests */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <ClipboardCheck size={20} color="#059669" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>{LABEL_DIAGNOSTIC_STEPS}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {guidance.suggestedDiagnosticSteps.map((step: string, idx: number) => (
                <div key={idx} style={{
                  background: '#f8fafc',
                  padding: '16px 20px',
                  borderRadius: 16,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#475569',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
                  {step}
                </div>
              ))}
            </div>
          </section>

          {/* 3. Carer's Corner (Dedicated Section) */}
          <section>
            <div style={{
              background: '#fdf4ff',
              borderRadius: 28,
              padding: '28px',
              border: '1px solid #fae8ff',
              height: '100%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Users size={20} color="#a855f7" />
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#4c1d95', margin: 0 }}>{LABEL_CARERS_CORNER}</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'none' }}>
                {guidance.carersCorner.map((tip: string, idx: number) => (
                  <li key={idx} style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: '#6b21a8',
                    marginBottom: 16,
                    fontWeight: 600,
                    position: 'relative'
                  }}>
                    <span style={{ position: 'absolute', left: -20, top: 0, color: '#a855f7' }}>•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </PageShell>
  );
};

export const NhsGuidancePage = memo(NhsGuidancePageBase);
