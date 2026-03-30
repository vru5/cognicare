import React from "react";
import { PageShell } from "./PageShell";
import { ReportHeader } from "./ReportHeader";
import { PillarRadar } from "./charts/PillarRadar";
import { ChevronRight } from "lucide-react";
import { PILLARS_CONFIG } from "../../constants/pillars";
import { PillarConfig } from "../../types/report";
import { ComparisonPageProps } from "../../types/props";

import { TITLE_HEALTH_MONITOR, LABEL_COMPARISON, TEXT_VS, LABEL_SINCE, LABEL_CHANGE, LABEL_WORSENED, LABEL_IMPROVED, LABEL_STABLE, LABEL_PILLAR_OVERVIEW, TITLE_COMPARATIVE_BREAKDOWN, LABEL_MOST_IMPROVED, LABEL_BIGGEST_WORSENING, TITLE_COMPARISON, SUBTITLE_COMPARISON_REPORT } from "../../constants/report";

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ data }) => {
  const { patient, period, comparison, summary } = data;

  return (
    <PageShell pageNum={3} totalPages={5} patientName={patient.name} patientId={patient.id}>
      <ReportHeader
        title={TITLE_COMPARISON}
        subtitle={`${SUBTITLE_COMPARISON_REPORT} (${period.dateA} ${TEXT_VS} ${period.dateB})`}
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
          background: '#f8f6f166',
          border: '1px solid #e8e4dc',
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 35,
          marginTop: -20,
          alignItems: 'center'
        }}>
          <div style={{ flex: 1.2, textAlign: 'center', padding: '24px 10px' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2.5, fontWeight: 800, marginBottom: 8 }}>{period.dateA}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>{comparison.totalA}</div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 6, fontWeight: 700 }}>
              <strong>{comparison.patientLogsA}P</strong> / <strong>{comparison.carerLogsA}C</strong>
            </div>
          </div>
          
          <div style={{ flex: 1, textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 10 }}>{LABEL_CHANGE}</div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 22px',
              borderRadius: 40,
              border: `2px solid ${comparison.overallChange > 0 ? '#c0674a' : comparison.overallChange < 0 ? '#22c55e' : '#94a3b8'}`,
              fontSize: 15,
              fontWeight: 900,
              color: comparison.overallChange > 0 ? '#c0674a' : comparison.overallChange < 0 ? '#22c55e' : '#94a3b8'
            }}>
              {comparison.overallChange > 0 ? '▲' : comparison.overallChange < 0 ? '▼' : '='} {comparison.overallChange > 0 ? LABEL_WORSENED : comparison.overallChange < 0 ? LABEL_IMPROVED : LABEL_STABLE} {Math.abs(comparison.overallChange)}
            </div>
          </div>

          <div style={{ flex: 1.2, textAlign: 'center', padding: '24px 10px' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2.5, fontWeight: 800, marginBottom: 8 }}>{period.dateB}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#c0674a', lineHeight: 1 }}>{comparison.totalB}</div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 6, fontWeight: 700 }}>
              <strong>{comparison.patientLogsB}P</strong> / <strong>{comparison.carerLogsB}C</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 320px' }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: '#999', marginBottom: 20 }}>{LABEL_PILLAR_OVERVIEW}</div>
            <PillarRadar
              scoresA={comparison.scoresA}
              scoresB={comparison.scoresB}
              patientScoresA={comparison.patientScoresA}
              carerScoresA={comparison.carerScoresA}
              patientScoresB={comparison.patientScoresB}
              carerScoresB={comparison.carerScoresB}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: '24px 30px',
              display: 'flex',
              gap: 30,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: '#64748b', fontWeight: 800, marginBottom: 4 }}>PATIENT</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#3d6b8f' }}>{(comparison.patientLogsA || 0) + (comparison.patientLogsB || 0)} logs</div>
              </div>
              <div style={{ width: 1, height: 40, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: '#64748b', fontWeight: 800, marginBottom: 4 }}>CARER</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#2ecc71' }}>{(comparison.carerLogsA || 0) + (comparison.carerLogsB || 0)} logs</div>
              </div>
            </div>

            <div style={{ background: '#fff5f2', border: '1px solid #f0c4b4', borderRadius: 20, padding: '20px 28px' }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#c0674a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>▲ {LABEL_BIGGEST_WORSENING}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2e', marginBottom: 6 }}>{comparison.biggestWorsening.label}</div>
              <div style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Score rose from <strong>{comparison.biggestWorsening.scoreA}</strong> → <strong>{comparison.biggestWorsening.scoreB}</strong></div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 20, padding: '20px 28px' }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>✓ {LABEL_MOST_IMPROVED}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2e', marginBottom: 6 }}>{comparison.biggestImprovement.label}</div>
              <div style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Score dropped from <strong>{comparison.biggestImprovement.scoreA}</strong> → <strong>{comparison.biggestImprovement.scoreB}</strong></div>
            </div>
          </div>
        </div>
        <h2 className="section-title" style={{ marginTop: 45, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{TITLE_COMPARATIVE_BREAKDOWN}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 15 }}>
          {PILLARS_CONFIG.map((p: PillarConfig) => {
            const valA = comparison.scoresA[p.key] || 0;
            const valB = comparison.scoresB[p.key] || 0;

            const isImprovement = valA > valB;
            const isWorsening = valB > valA;
            const diff = isImprovement ? (valA - valB) : (valB - valA);
            const diffColor = isImprovement ? '#16a34a' : isWorsening ? '#dc2626' : '#94a3b8';

            const pCountA = comparison.patientPillarLogsA?.[p.key] || 0;
            const cCountA = comparison.carerPillarLogsA?.[p.key] || 0;
            const pCountB = comparison.patientPillarLogsB?.[p.key] || 0;
            const cCountB = comparison.carerPillarLogsB?.[p.key] || 0;

            return (
              <div key={p.key} style={{
                background: '#fdfcfa',
                border: '1px solid #e8e4dc',
                borderRadius: 20,
                padding: '24px 28px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{p.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: p.color }}>{p.label}</span>
                  </div>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: diffColor
                  }}>
                    {diff.toFixed(1)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, textTransform: 'uppercase', color: '#999', fontWeight: 800, marginBottom: 2 }}>{period.dateA}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#1a1a2e' }}>{valA.toFixed(1)}</div>
                    <div style={{ fontSize: 8, color: '#999', fontWeight: 700 }}>P:{pCountA} / C:{cCountA}</div>
                  </div>
                  <ChevronRight size={14} color="#e2e8f0" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, textTransform: 'uppercase', color: '#999', fontWeight: 800, marginBottom: 2 }}>{period.dateB}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: isWorsening ? '#dc2626' : '#1a1a2e' }}>{valB.toFixed(1)}</div>
                    <div style={{ fontSize: 8, color: '#999', fontWeight: 700 }}>P:{pCountB} / C:{cCountB}</div>
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

