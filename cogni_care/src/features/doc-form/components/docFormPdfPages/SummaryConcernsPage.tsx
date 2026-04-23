import React from "react";
import { DocFormHeader } from "../DocFormHeader";
import { SummaryConcernsPageProps } from "../../types/docPdf";
import { PageShell, CheckMark } from "../PdfComponents";
import { SeverityGauge } from "../SeverityGauge";
import { CONCERN_ITEMS, SEVERITY_LEVELS } from "../../constants/docFormConfig";
import { DOC_FORM_STRINGS } from "../../constants/docStrings";

export const SummaryConcernsPage: React.FC<SummaryConcernsPageProps> = ({
  patient,
  mergedPatient,
  totalPages,
  pageNum,
  scoreData,
  concerns,
  aiHistoryGrade
}) => {
  const sources = [
    { label: DOC_FORM_STRINGS.SUMMARY.SOURCES_SB, score: scoreData.symptomScore, max: 30, c: "#3d6b8f", desc: `${scoreData.presentCount} ${DOC_FORM_STRINGS.SUMMARY.STATS_PRESENT} · ${scoreData.worseCount} ${DOC_FORM_STRINGS.SUMMARY.STATS_WORSE}` },
    { label: DOC_FORM_STRINGS.SUMMARY.SOURCES_HP, score: scoreData.historyScore, max: 15, c: "#6b52ae", desc: aiHistoryGrade !== null ? DOC_FORM_STRINGS.GENERAL.AI_EVALUATED : DOC_FORM_STRINGS.GENERAL.FIELDS_COMPLETED },
    { label: DOC_FORM_STRINGS.SUMMARY.SOURCES_TC, score: scoreData.tesScore, max: 55, c: "#c0674a", desc: `${DOC_FORM_STRINGS.SUMMARY.STATS_RHI}:${scoreData.rhiMet} · ${DOC_FORM_STRINGS.SUMMARY.STATS_CORE}:${scoreData.coreMet} · ${DOC_FORM_STRINGS.SUMMARY.STATS_SUP}:${scoreData.supMet}` },
  ];

  // Determine current severity level based on score
  const currentLevel = [...SEVERITY_LEVELS].reverse().find(l => scoreData.total >= l.minScore) || SEVERITY_LEVELS[0];
  const { label: level, color: col, bg, urgency } = currentLevel;

  return (
    <div className="report-page">
      <PageShell pageNum={pageNum} totalPages={totalPages} patient={patient}>
        <DocFormHeader title={`${DOC_FORM_STRINGS.GENERAL.DOC_FORM_TITLE} — ${DOC_FORM_STRINGS.SUMMARY.SEVERITY_CONCERNS}`} patient={mergedPatient} />

        <div style={{ padding: "18px 40px 0" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", marginBottom: 16 }}>{DOC_FORM_STRINGS.SUMMARY.SECTION_TITLE}</div>
          <div style={{ background: bg, border: `1.5px solid ${col}40`, borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: "0 0 240px", textAlign: "center" }}>
                <div style={{ width: 240, height: 130, margin: "0 auto" }}>
                  <SeverityGauge score={scoreData.total} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: col }}>{level}</div>
              </div>

              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 12, color: "#444", lineHeight: 1.65, marginBottom: 16, padding: "10px 14px", background: "rgba(255,255,255,.75)", borderRadius: 9, borderLeft: `4px solid ${col}` }}>
                  {urgency}
                </div>
                {sources.map(src => (
                  <div key={src.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#444" }}>{src.label}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "#bbb" }}>{src.desc}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: src.c }}>{src.score}<span style={{ fontSize: 9, color: "#ccc" }}>/{src.max}</span></span>
                      </div>
                    </div>
                    <div style={{ height: 7, background: "#e8e4dc", borderRadius: 4 }}>
                      <div style={{ height: "100%", width: `${(src.score / src.max) * 100}%`, background: src.c, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
                  {SEVERITY_LEVELS.map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#666" }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e", marginBottom: 12 }}>{DOC_FORM_STRINGS.CONCERNS.PROVIDER_LABEL}</div>
          <div style={{ background: "#fff", border: "1.5px solid #e8e4dc", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
            {CONCERN_ITEMS.map((item, i) => {
              const checked = concerns[i];
              return (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", borderBottom: i < CONCERN_ITEMS.length - 1 ? "1px solid #f0ece6" : "none", background: checked ? "#eef4f9" : "#fff" }}>
                  <CheckMark checked={!!checked} />
                  <span style={{ fontSize: 12, color: checked ? "#1a1a2e" : "#bbb", fontWeight: checked ? 600 : 400, lineHeight: 1.5 }}>{item}</span>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#fdf6e7", border: "1px solid #f0c96a", borderRadius: 10, padding: "14px 16px", fontSize: 11, color: "#7a5c1e", lineHeight: 1.6, textAlign: "center" }}>
            {DOC_FORM_STRINGS.SUMMARY.DISCLAIMER}<br />
            <b>{DOC_FORM_STRINGS.GENERAL.CONFIDENTIAL} — {mergedPatient?.name} · {mergedPatient?.id} · {DOC_FORM_STRINGS.GENERAL.PAGE} {mergedPatient?.evaluationDate}</b>
          </div>
        </div>
      </PageShell>
    </div>
  );
};
