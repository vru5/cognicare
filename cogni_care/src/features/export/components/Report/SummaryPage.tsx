import React from "react";
import { PageShell } from "./PageShell";
import { ReportHeader } from "./ReportHeader";
import { DoughnutChart } from "./charts/DoughnutChart";
import { SparkLine } from "./charts/SparkLine";
import { PILLARS_CONFIG } from "../../constants/pillars";
import { PillarConfig } from "../../types/report";
import { SummaryPageProps } from "../../types/props";

import { TITLE_HEALTH_MONITOR, SUBTITLE_SYMPTOM_ANALYSIS, LABEL_DIAGNOSIS_DATE, LABEL_TOTAL_LOGS, LABEL_HIGHEST_BURDEN, LABEL_MOST_MANAGED, TITLE_BURDEN_BY_PILLAR, TITLE_TRENDS_BY_PILLAR, TEXT_BURDEN_DESCRIPTION } from "../../constants/report";

export const SummaryPage: React.FC<SummaryPageProps> = ({ data }) => {
  const { patient, overall, summary } = data;
  const { patientPillarLogs, carerPillarLogs, patientMonthlyLogs, carerMonthlyLogs } = overall;

  return (
    <PageShell pageNum={1} totalPages={5} patientName={patient.name} patientId={patient.id}>
      <ReportHeader
        title={TITLE_HEALTH_MONITOR}
        subtitle={SUBTITLE_SYMPTOM_ANALYSIS}
        patient={patient}
        summary={summary}
      />
      <main className="report-body">
        <div style={{
          display: 'flex',
          background: '#fdfcfa',
          border: '1px solid #e8e4dc',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 35,
          marginTop: -20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          {[
            { label: 'PATIENT LOGS', value: summary.patientLogsCount, color: '#1a1a2e' },
            { label: 'CARER LOGS', value: summary.carerLogsCount, color: '#1a1a2e' },
            { label: 'TOTAL LOGS', value: summary.totalLogs, color: '#1a1a2e' },
            { label: 'HIGHEST BURDEN', value: summary.highestBurden.label, color: summary.highestBurden.color },
            { label: 'MOST MANAGED', value: summary.mostManaged.label, color: summary.mostManaged.color }
          ].map((item, i) => (
            <div key={i} style={{
              flex: 1,
              textAlign: 'center',
              padding: '24px 10px',
              borderRight: i === 4 ? 'none' : '1px solid #f0ece6'
            }}>
              <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        <h2 className="section-title" style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{TITLE_BURDEN_BY_PILLAR}</h2>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 25, marginTop: -10, opacity: 0.8 }}>
          {TEXT_BURDEN_DESCRIPTION} {summary.diagnosisDate}.
        </div>

        <DoughnutChart
          averages={overall.pillarAvg}
          patientPillarLogs={patientPillarLogs}
          carerPillarLogs={carerPillarLogs}
        />

        <h2 className="section-title" style={{ marginTop: 45, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{TITLE_TRENDS_BY_PILLAR}</h2>
        <div style={{
          border: '1px solid #e8e4dc',
          borderRadius: 16,
          overflow: 'hidden',
          background: '#fff',
          marginBottom: 30
        }}>
          <div style={{
            display: 'flex',
            background: '#f8f6f1',
            padding: '14px 20px',
            borderBottom: '1px solid #e8e4dc',
            fontSize: 9,
            fontWeight: 900,
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: 1.5
          }}>
            <div style={{ flex: "0 0 130px" }}>Pillar</div>
            {overall.months.map((m: string) => <div key={m} style={{ flex: 1, textAlign: "center" }}>{m}</div>)}
            <div style={{ flex: "0 0 100px", textAlign: "center" }}>Trend</div>
          </div>
          {PILLARS_CONFIG.map((p: PillarConfig, idx: number) => (
            <div key={p.key} style={{
              display: 'flex',
              padding: '16px 20px',
              alignItems: 'center',
              borderBottom: idx === PILLARS_CONFIG.length - 1 ? 'none' : '1px solid #f0ece6'
            }}>
              <div style={{ flex: "0 0 130px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: p.color }}>{p.label}</span>
              </div>
              {overall.months.map((_: string, j: number) => {
                const value = overall.monthlyTrend[p.key]?.[j];
                const pCount = patientMonthlyLogs?.[p.key]?.[j] || 0;
                const cCount = carerMonthlyLogs?.[p.key]?.[j] || 0;

                return (
                  <div key={j} style={{ flex: 1, textAlign: "center" }}>
                    {value != null ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e" }}>{value.toFixed(1)}</span>
                        <div style={{ fontSize: 8, color: '#999', fontWeight: 700, opacity: 0.7 }}>
                          {pCount > 0 && <span>P:{pCount}</span>}
                          {pCount > 0 && cCount > 0 && <span> / </span>}
                          {cCount > 0 && <span>C:{cCount}</span>}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: "#ccc" }}>—</span>
                    )}
                  </div>
                );
              })}
              <div style={{ flex: "0 0 100px", display: "flex", justifyContent: "center" }}>
                <SparkLine
                  trend={(overall.monthlyTrend[p.key] || []).slice(0, overall.months.length)}
                  color={p.color}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
};
