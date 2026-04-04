import React, { memo } from "react";
import { PageShell } from "./PageShell";
import { ReportHeader } from "./ReportHeader";
import { PILLARS_CONFIG } from "../../constants/pillars";
import { AIInsightsPageProps } from "../../types/props";
import { 
  TITLE_AI_ANALYSIS, 
  SUBTITLE_OVERALL_PATTERNS, 
  LABEL_PERIOD,
  LABEL_SAFETY_ALERTS,
  LABEL_CLINICAL_CONCERN,
  TEXT_CONTINUATION
} from "../../constants/report";
import { getStatusConfig, getPillarInfo } from "../../utils/reportHelpers";


const AIInsightsPageBase: React.FC<AIInsightsPageProps> = ({ 
  patient, 
  ai, 
  summary, 
  period,
  pageNum,
  totalPages,
  isContinuation = false
}) => {
  const { status, topConcern, keyFindings, criticalRisks } = ai;
  const statusCfg = getStatusConfig(status);

  // Filter out empty findings
  const filteredFindings = (keyFindings || []).filter(f => 
    !f.subCategory.toLowerCase().includes("no specific data") && 
    !f.finding.toLowerCase().includes("no specific data")
  );

  // Split Findings: If more than 2 risks, we show first 2 findings on p1, rest on p2.
  const needsSplit = (criticalRisks || []).length > 2;
  const visibleFindings = isContinuation 
    ? filteredFindings.slice(2) 
    : (needsSplit ? filteredFindings.slice(0, 2) : filteredFindings);

  const pageTitle = isContinuation ? `${TITLE_AI_ANALYSIS} ${TEXT_CONTINUATION}` : TITLE_AI_ANALYSIS;

  return (
    <PageShell pageNum={pageNum} totalPages={totalPages} patientName={patient.name} patientId={patient.id}>
      <ReportHeader
        title={pageTitle}
        subtitle={SUBTITLE_OVERALL_PATTERNS}
        patient={patient}
        summary={summary}
        periodInfo={{ 
          label: LABEL_PERIOD, 
          value: `${period.dateA} — ${period.dateB}`,
          sub: `${period.entries} symptom logs`
        }}
      />

      <main className="report-body" style={{ padding: '0 40px', marginTop: 20, position: 'relative' }}>
        {/* 1. Status Badge (Dynamic Top-Right Corner) */}
        {!isContinuation && (
          <div style={{ 
            position: 'absolute',
            top: -10,
            right: 40,
            background: statusCfg.bg,
            border: `1px solid ${statusCfg.color}40`,
            borderRadius: 50,
            padding: '6px 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: statusCfg.color }} />
            <span style={{ 
              fontSize: 9, 
              fontWeight: 900, 
              color: statusCfg.color, 
              textTransform: 'uppercase', 
              letterSpacing: 2 
            }}>
              {statusCfg.label}
            </span>
          </div>
        )}

        {/* 2. Primary Clinical Concern Section (Only on Page 1) */}
        {!isContinuation && topConcern && (
           <div style={{ 
             background: '#fff',
             border: '1px solid #fee2e2',
             borderLeft: '6px solid #ef4444',
             borderRadius: 20,
             padding: '20px 28px',
             marginBottom: 30,
             display: 'flex',
             gap: 20,
             alignItems: 'center'
           }}>
             <div style={{ fontSize: 36 }}>⚠️</div>
             <div style={{ flex: 1 }}>
               <div style={{ fontSize: 10, fontWeight: 900, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
                 Primary Clinical Concern: {topConcern.pillar}
               </div>
               <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>
                 {topConcern.reason}
               </div>
             </div>
           </div>
        )}

        {/* 3. Critical Risks Section (Only on Page 1) */}
        {!isContinuation && criticalRisks && criticalRisks.length > 0 && (
          <div style={{ marginBottom: 30 }}>
             <h4 style={{ fontSize: 11, fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16 }}>
               {LABEL_SAFETY_ALERTS}
             </h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
               {criticalRisks.map((risk, idx) => (
                 <div key={idx} style={{ 
                   background: '#fef2f2', 
                   border: '1px solid #fee2e2', 
                   borderRadius: 18, 
                   padding: '18px 24px',
                   display: 'flex',
                   gap: 16,
                   alignItems: 'center'
                 }}>
                   <span style={{ fontSize: 24 }}>🚨</span>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontSize: 10, fontWeight: 900, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{risk.type} Alert</div>
                     <div style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c' }}>{risk.message}</div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* 4. Key Findings Section (Split) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {visibleFindings.map((finding, idx) => {
            const pInfo = getPillarInfo(finding.pillar);
            return (
              <div key={idx} style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderLeft: `6px solid ${pInfo.color}`,
                borderRadius: 20,
                padding: '24px 28px',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 22 }}>{pInfo.icon}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: pInfo.color, textTransform: 'uppercase', letterSpacing: 1.5 }}>{finding.pillar}</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#1a1a2e' }}>{finding.subCategory}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#4b5563', lineHeight: 1.6, fontWeight: 500 }}>
                  {finding.finding}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </PageShell>
  );
};

// Wrap component in memo to skip re-renders if the data hasn't changed
export const AIInsightsPage = memo(AIInsightsPageBase);
