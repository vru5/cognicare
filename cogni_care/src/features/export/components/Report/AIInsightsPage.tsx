import React, { useMemo, memo } from "react";
import { PageShell } from "./PageShell";
import { ReportHeader } from "./ReportHeader";
import { PILLARS_CONFIG } from "../../constants/pillars";
import { ReportData, PillarConfig, ProcessedInsight } from "../../types/report";
import { AIInsightsPageProps } from "../../types/props";
import { TITLE_AI_ANALYSIS, SUBTITLE_OVERALL_PATTERNS } from "../../constants/report";

const AIInsightsPageBase: React.FC<AIInsightsPageProps> = ({ patient, ai, summary }) => {
  // Memoize the processed insights calculations
  const processedInsights = useMemo<ProcessedInsight[]>(() => {
    return ai.overallInsights.slice(0, 4).map((ins, i) => { // Only 4 for 2x2 grid
      const pillarCfg = PILLARS_CONFIG.find((p: PillarConfig) =>
        p.label.toLowerCase() === ins.pillar.toLowerCase() ||
        p.key.toLowerCase() === ins.pillar.toLowerCase()
      );
      
      const color = pillarCfg?.color || '#5fa8d3';
      const borderColor = color + '33';
      
      return {
        ...ins,
        color,
        borderColor,
        isLast: false // Not needed for fixed grid
      };
    });
  }, [ai.overallInsights]);

  return (
    <PageShell pageNum={2} totalPages={5} patientName={patient.name} patientId={patient.id}>
      <ReportHeader
        title={TITLE_AI_ANALYSIS}
        subtitle={SUBTITLE_OVERALL_PATTERNS}
        patient={patient}
        summary={summary}
      />
      <main className="report-body">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gridTemplateRows: '1fr 1fr',
          gap: 24, 
          marginTop: 15 
        }}>
          {processedInsights.map((ins: ProcessedInsight, i: number) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderLeft: `5px solid ${ins.color}`,
                borderRadius: 24,
                padding: '30px 32px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 280
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>{ins.icon}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: ins.color,
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {ins.pillar} · {ins.type}
                </span>
              </div>
              <div style={{ 
                fontSize: 22, 
                fontWeight: 900, 
                color: '#1a1a2e', 
                marginBottom: 14,
                lineHeight: 1.2 
              }}>
                {ins.title}
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: 13, 
                color: '#4b5563', 
                lineHeight: 1.8, 
                opacity: 0.9,
                fontWeight: 500 
              }}>
                {ins.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
};

// Wrap component in memo to skip re-renders if the data hasn't changed
export const AIInsightsPage = memo(AIInsightsPageBase);
