import React from "react";
import { DocFormHeader } from "../DocFormHeader";
import { SYMPTOM_ROWS } from "@/constants/symptoms";
import { SymptomPart1PageProps } from "../../types/docPdf";
import { PageShell, CheckMark, DurationBadge, TrendBadge } from "../PdfComponents";
import { DOC_FORM_STRINGS } from "../../constants/docStrings";

export const SymptomPart1Page: React.FC<SymptomPart1PageProps> = ({
  patient,
  mergedPatient,
  totalPages,
  pageNum,
  symptoms,
  presentCount
}) => {
  return (
    <div className="report-page">
      <PageShell pageNum={pageNum} totalPages={totalPages} patient={patient}>
        <DocFormHeader title={`${DOC_FORM_STRINGS.GENERAL.DOC_FORM_TITLE} — ${DOC_FORM_STRINGS.SYMPTOMS.REPORT_PART_1}`} patient={mergedPatient} />

        <div style={{ margin: "18px 40px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 4 }}>{DOC_FORM_STRINGS.SYMPTOMS.SECTION_TITLE} — {DOC_FORM_STRINGS.GENERAL.PART_1}</div>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 10 }}>
            {presentCount} {DOC_FORM_STRINGS.SYMPTOMS.MARKED} {DOC_FORM_STRINGS.SYMPTOMS.PRESENT_OUT_OF} {SYMPTOM_ROWS.length} {DOC_FORM_STRINGS.SYMPTOMS.TOTAL_ASSESSED}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 10px", background: "#1a1a2e", color: "#fff", textAlign: "left", fontWeight: 700, borderRadius: "8px 0 0 0", width: 24 }}>✓</th>
                <th style={{ padding: "8px 10px", background: "#1a1a2e", color: "#fff", textAlign: "left", fontWeight: 700 }}>{DOC_FORM_STRINGS.SYMPTOMS.SYMPTOM_HEADER}</th>
                <th style={{ padding: "8px 10px", background: "#16213e", color: "#fff", textAlign: "center", fontWeight: 700, borderLeft: "2px solid #0f3460" }}>{DOC_FORM_STRINGS.SYMPTOMS.DURATION}</th>
                <th style={{ padding: "8px 10px", background: "#2e4057", color: "#fff", textAlign: "center", fontWeight: 700, borderLeft: "2px solid #0f3460", borderRadius: "0 8px 0 0" }}>{DOC_FORM_STRINGS.SYMPTOMS.CLINICAL_TREND}</th>
              </tr>
            </thead>
            <tbody>
              {SYMPTOM_ROWS.slice(0, 20).map((sym, i) => {
                const row = symptoms[sym] || {};
                const duration = row.sixMonths ? "6months+" : row.recent ? "recent" : null;
                const trend = row.worse ? "worse" : row.improving ? "improving" : row.same ? "same" : null;
                return (
                  <tr key={sym} style={{ background: i % 2 === 0 ? "#fff" : "#fafaf8", borderBottom: "1px solid #f0ece6" }}>
                    <td style={{ padding: "6px 10px", textAlign: "center", verticalAlign: "middle" }}><CheckMark checked={!!row.present} /></td>
                    <td style={{ padding: "6px 10px", color: row.present ? "#1a1a2e" : "#bbb", fontWeight: row.present ? 600 : 400, verticalAlign: "middle" }}>{sym}</td>
                    <td style={{ padding: "6px 10px", textAlign: "center", borderLeft: "2px solid #f0ece6", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {row.present && duration && <DurationBadge duration={duration} />}
                      </div>
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "center", borderLeft: "2px solid #f0ece6", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {row.present && trend && <TrendBadge trend={trend} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageShell>
    </div>
  );
};
