import React from "react";
import { PageShell } from "./PageShell";
import { ReportHeader } from "./ReportHeader";
import { DoughnutChart } from "./charts/DoughnutChart";
import { MajorSymptomsReportCard } from "./MajorSymptomsReportCard";
import { SummaryPageProps } from "../../types/props";

import { TITLE_HEALTH_MONITOR, TITLE_BURDEN_BY_PILLAR, TEXT_BURDEN_DESCRIPTION, LABEL_PERIOD } from "../../constants/report";

export const SummaryPage: React.FC<SummaryPageProps> = ({ data, pageNum, totalPages }) => {
  const { patient, summary, comparison, period } = data;

  return (
    <PageShell pageNum={pageNum} totalPages={totalPages} patientName={patient.name} patientId={patient.id}>
      <ReportHeader
        title={TITLE_HEALTH_MONITOR}
        subtitle="Overall Symptom Analysis"
        patient={patient}
        summary={summary}
        periodInfo={{ 
          label: LABEL_PERIOD, 
          value: `${period.dateA} — ${period.dateB}`,
          sub: `${period.entries} symptom logs`
        }}
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

        <h2 className="section-title" style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{TITLE_BURDEN_BY_PILLAR.replace("Overall ", "")}</h2>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 25, marginTop: -10, opacity: 0.8, fontWeight: 800, letterSpacing: 0.5 }}>
          {TEXT_BURDEN_DESCRIPTION.split("since")[0].trim()} for the period {period.dateA} — {period.dateB}.
        </div>

        <DoughnutChart
          averages={data.overall.periodPillarAvg || {}}
          patientPillarLogs={data.overall.patientPeriodPillarLogs || {}}
          carerPillarLogs={data.overall.carerPeriodPillarLogs || {}}
        />

        <MajorSymptomsReportCard
          symptoms={summary.majorSymptoms.topSymptoms}
          alerts={summary.majorSymptoms.alerts}
        />


      </main>
    </PageShell>
  );
};
