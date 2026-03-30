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
          background: '#fff',
          border: '1px solid #e8e4dc',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 35,
          marginTop: -15,
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '20px 10px', borderRight: '1px solid #f0ece6' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>PATIENT LOGS</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#1a1a2e' }}>{summary.patientLogsCount}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '20px 10px', borderRight: '1px solid #f0ece6' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>CARER LOGS</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#1a1a2e' }}>{summary.carerLogsCount}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '20px 10px', borderRight: '1px solid #f0ece6' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>{LABEL_TOTAL_LOGS}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#1a1a2e' }}>{summary.totalLogs}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '20px 10px', borderRight: '1px solid #f0ece6' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>{LABEL_HIGHEST_BURDEN}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: summary.highestBurden.color }}>{summary.highestBurden.label}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>{LABEL_MOST_MANAGED}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: summary.mostManaged.color }}>{summary.mostManaged.label}</div>
          </div>
        </div>

        <h2 className="section-title">{TITLE_BURDEN_BY_PILLAR}</h2>
        <div style={{ fontSize: 10.5, color: "#666", marginBottom: 20, marginTop: -10 }}>
          {TEXT_BURDEN_DESCRIPTION} {summary.diagnosisDate}.
        </div>

        <DoughnutChart 
          averages={overall.pillarAvg} 
          patientPillarLogs={patientPillarLogs}
          carerPillarLogs={carerPillarLogs}
        />

        {/* The Overall Symptom Burden section was removed as per user feedback to focus on monthly trends and log counts in the table below */}

        <h2 className="section-title" style={{ marginTop: 40 }}>{TITLE_TRENDS_BY_PILLAR}</h2>
        <div className="trend-table" style={{ marginBottom: 30 }}>
          <div className="trend-header">
            <div style={{ flex: "0 0 130px" }}>Pillar</div>
            {overall.months.map((m: string) => <div key={m} style={{ flex: 1, textAlign: "center" }}>{m}</div>)}
            <div style={{ flex: "0 0 100px", textAlign: "center" }}>Trend</div>
          </div>
          {PILLARS_CONFIG.map((p: PillarConfig, idx: number) => (
            <div key={p.key} className="trend-row" style={{ borderBottom: idx === PILLARS_CONFIG.length - 1 ? 'none' : '1px solid #f0ece6' }}>
              <div style={{ flex: "0 0 130px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13 }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.label}</span>
              </div>
              {overall.months.map((_: string, j: number) => {
                const value = overall.monthlyTrend[p.key]?.[j];
                const pCount = patientMonthlyLogs?.[p.key]?.[j] || 0;
                const cCount = carerMonthlyLogs?.[p.key]?.[j] || 0;

                return (
                  <div key={j} style={{ flex: 1, textAlign: "center" }}>
                    {value != null ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#444" }}>{value.toFixed(1)}</span>
                        {(pCount > 0 || cCount > 0) && (
                          <div style={{ fontSize: 8, color: '#999', opacity: 0.8 }}>
                            {pCount > 0 && <span>P:{pCount}</span>}
                            {pCount > 0 && cCount > 0 && <span style={{ margin: '0 1px' }}>/</span>}
                            {cCount > 0 && <span>C:{cCount}</span>}
                          </div>
                        )}
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
                  patientTrend={(overall.patientMonthlyTrend?.[p.key] || []).slice(0, overall.months.length)}
                  carerTrend={(overall.carerMonthlyTrend?.[p.key] || []).slice(0, overall.months.length)}
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
