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
    return ai.overallInsights.slice(0, 5).map((ins, i) => {
      const pillarCfg = PILLARS_CONFIG.find((p: PillarConfig) =>
        p.label.toLowerCase() === ins.pillar.toLowerCase() ||
        p.key.toLowerCase() === ins.pillar.toLowerCase()
      );
      
      const color = pillarCfg?.color || '#5fa8d3';
      const borderColor = color + '33';
      
      // Calculate layout information
      const isLast = (i === 4 && ai.overallInsights.length >= 5) ||
        (i === ai.overallInsights.length - 1 && ai.overallInsights.length % 2 !== 0);

      return {
        ...ins,
        color,
        borderColor,
        isLast
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 10 }}>
          {processedInsights.map((ins: ProcessedInsight, i: number) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: `1px solid ${ins.borderColor}`,
                borderLeft: `5px solid ${ins.color}`,
                borderRadius: 16,
                padding: '20px 24px',
                gridColumn: ins.isLast ? '1 / -1' : undefined,
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{ins.icon}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: ins.color,
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {ins.pillar} · {ins.type}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#1a1a2e', marginBottom: 8 }}>{ins.title}</div>
              <p style={{ margin: 0, fontSize: 12, color: '#4b5563', lineHeight: 1.7, opacity: 0.9 }}>{ins.body}</p>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
};

// Wrap component in memo to skip re-renders if the data hasn't changed
export const AIInsightsPage = memo(AIInsightsPageBase);
