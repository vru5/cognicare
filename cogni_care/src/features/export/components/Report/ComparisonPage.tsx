import React from "react";
import { PageShell } from "./PageShell";
import { ReportHeader } from "./ReportHeader";
import { PillarRadar } from "./charts/PillarRadar";
import { ChevronRight } from "lucide-react";
import { PILLARS_CONFIG } from "../../constants/pillars";
import { PillarConfig } from "../../types/report";
import { ComparisonPageProps } from "../../types/props";

import { TITLE_HEALTH_MONITOR, LABEL_COMPARISON, TEXT_VS, LABEL_SINCE, LABEL_CHANGE, LABEL_WORSENED, LABEL_IMPROVED, LABEL_STABLE, LABEL_PILLAR_OVERVIEW, TITLE_COMPARATIVE_BREAKDOWN, LABEL_MOST_IMPROVED, LABEL_BIGGEST_WORSENING } from "../../constants/report";

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ data }) => {
  const { patient, period, comparison, summary } = data;

  return (
    <PageShell pageNum={3} totalPages={5} patientName={patient.name} patientId={patient.id}>
      <ReportHeader
        title={TITLE_HEALTH_MONITOR}
        subtitle={`Single Day Analysis`}
        patient={patient}
        summary={summary}
        periodInfo={{
          label: LABEL_COMPARISON,
          value: `${period.dateA} ${TEXT_VS} ${period.dateB}`,
          sub: `${LABEL_SINCE} ${patient.diagnosisDate}`
        }}
      />
      <main className="report-body">
        <div style={{
          display: 'flex',
          background: '#f8f6f1',
          border: '1px solid #e8e4dc',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 28,
          marginTop: -15
        }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '16px 10px', borderRight: '1px solid #e8e4dc' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 4 }}>{period.dateA}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>{comparison.totalA}</div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
              <strong>{comparison.patientLogsA}P</strong> / <strong>{comparison.carerLogsA}C</strong>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '16px 10px', borderRight: '1px solid #e8e4dc' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>{LABEL_CHANGE}</div>
            <div style={{
              display: 'inline-block',
              padding: '8px 18px',
              borderRadius: 30,
              border: `2px solid ${comparison.overallChange > 0 ? '#c0674a' : comparison.overallChange < 0 ? '#22c55e' : '#94a3b8'}`,
              fontSize: 14,
              fontWeight: 800,
              color: comparison.overallChange > 0 ? '#c0674a' : comparison.overallChange < 0 ? '#22c55e' : '#94a3b8'
            }}>
              {comparison.overallChange > 0 ? '▲' : comparison.overallChange < 0 ? '▼' : '='} {comparison.overallChange > 0 ? LABEL_WORSENED : comparison.overallChange < 0 ? LABEL_IMPROVED : LABEL_STABLE} {Math.abs(comparison.overallChange)}
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '16px 10px' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 4 }}>{period.dateB}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#c0674a', lineHeight: 1 }}>{comparison.totalB}</div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
              <strong>{comparison.patientLogsB}P</strong> / <strong>{comparison.carerLogsB}C</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 30, marginBottom: 28 }}>
          <div style={{ flex: '0 0 220px' }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>{LABEL_PILLAR_OVERVIEW}</div>
            <PillarRadar 
              scoresA={comparison.scoresA} 
              scoresB={comparison.scoresB} 
              patientScoresA={comparison.patientScoresA}
              carerScoresA={comparison.carerScoresA}
              patientScoresB={comparison.patientScoresB}
              carerScoresB={comparison.carerScoresB}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: 14, 
              padding: '16px 20px', 
              display: 'flex', 
              gap: 24, 
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: '#64748b', fontWeight: 800, marginBottom: 2 }}>PATIENT</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#3d6b8f' }}>{(comparison.patientLogsA || 0) + (comparison.patientLogsB || 0)} logs</div>
              </div>
              <div style={{ width: 1, height: 28, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: '#64748b', fontWeight: 800, marginBottom: 2 }}>CARER</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#2ecc71' }}>{(comparison.carerLogsA || 0) + (comparison.carerLogsB || 0)} logs</div>
              </div>
            </div>
            <div style={{ background: '#fff5f2', border: '1px solid #f0c4b4', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#c0674a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>▲ {LABEL_BIGGEST_WORSENING}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a2e', marginBottom: 4 }}>{comparison.biggestWorsening.label}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Score rose from <strong>{comparison.biggestWorsening.scoreA}</strong> → <strong>{comparison.biggestWorsening.scoreB}</strong></div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>✓ {LABEL_MOST_IMPROVED}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a2e', marginBottom: 4 }}>{comparison.biggestImprovement.label}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Score dropped from <strong>{comparison.biggestImprovement.scoreA}</strong> → <strong>{comparison.biggestImprovement.scoreB}</strong></div>
            </div>
          </div>
        </div>

        <h2 className="section-title">{TITLE_COMPARATIVE_BREAKDOWN}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {PILLARS_CONFIG.map((p: PillarConfig) => {
            const valA = comparison.scoresA[p.key] || 0;
            const valB = comparison.scoresB[p.key] || 0;

            // Re-order so whichever severity is greater is on the left
            const valLeft = Math.max(valA, valB);
            const valRight = Math.min(valA, valB);
            const labelLeft = valA >= valB ? period.dateA : period.dateB;
            const labelRight = valA >= valB ? period.dateB : period.dateA;

            // Logic: -ve (worsening) is red, +ve (improvement) is green
            // If valA > valB: valLeft=valA, valRight=valB. Diff = Left - Right = +ve (Improvement) -> Green
            // If valB > valA: valLeft=valB, valRight=valA. Diff = Right - Left = -ve (Worsening) -> Red
            const isImprovement = valA > valB;
            const isWorsening = valB > valA;
            const displayDiff = isImprovement ? +(valA - valB).toFixed(1) : isWorsening ? -(valB - valA).toFixed(1) : 0;
            const diffColor = isImprovement ? '#16a34a' : isWorsening ? '#dc2626' : '#94a3b8';
            const pCountLeft = valA >= valB ? (comparison.patientPillarLogsA[p.key]||0) : (comparison.patientPillarLogsB[p.key]||0);
            const cCountLeft = valA >= valB ? (comparison.carerPillarLogsA[p.key]||0) : (comparison.carerPillarLogsB[p.key]||0);
            const pCountRight = valA >= valB ? (comparison.patientPillarLogsB[p.key]||0) : (comparison.patientPillarLogsA[p.key]||0);
            const cCountRight = valA >= valB ? (comparison.carerPillarLogsB[p.key]||0) : (comparison.carerPillarLogsA[p.key]||0);

            return (
              <div key={p.key} className="comp-pillar-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{p.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: p.color }}>{p.label}</span>
                  </div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: diffColor,
                    padding: '4px 0',
                    borderRadius: 8
                  }}>
                    {displayDiff > 0 ? `+${displayDiff}` : displayDiff < 0 ? displayDiff : LABEL_STABLE.toLowerCase()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 10, color: '#666', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 8, textTransform: 'uppercase', color: '#999' }}>{labelLeft}</span>
                    <strong style={{ fontSize: 13, color: '#1a1a2e' }}>P:{pCountLeft} / C:{cCountLeft}</strong>
                    <div style={{ fontSize: 8, color: '#999', marginTop: 1, opacity: 0.8 }}>
                      Severity: {valLeft}
                    </div>
                  </div>
                  <ChevronRight size={12} color="#ccc" style={{ marginTop: 2 }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 8, textTransform: 'uppercase', color: '#999' }}>{labelRight}</span>
                    <strong style={{ fontSize: 13, color: '#1a1a2e' }}>P:{pCountRight} / C:{cCountRight}</strong>
                    <div style={{ fontSize: 8, color: '#999', marginTop: 1, opacity: 0.8 }}>
                      Severity: {valRight}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </PageShell>
  );
};
