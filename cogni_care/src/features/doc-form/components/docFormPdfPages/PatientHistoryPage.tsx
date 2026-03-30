import React from "react";
import { DocFormHeader } from "../DocFormHeader";
import { HistoryData } from "../../types/docForm";
import { PatientHistoryPageProps } from "../../types/docPdf";
import { PageShell } from "../PdfComponents";
import { HISTORY_FIELDS } from "../../constants/docFormConfig";
import { DOC_FORM_STRINGS } from "../../constants/docStrings";

export const PatientHistoryPage: React.FC<PatientHistoryPageProps> = ({
  patient,
  mergedPatient,
  totalPages,
  history,
}) => {
  const historyFields = HISTORY_FIELDS;

  return (
    <div className="report-page">
      <PageShell pageNum={3} totalPages={totalPages} patient={patient}>
        <DocFormHeader title={`${DOC_FORM_STRINGS.GENERAL.DOC_FORM_TITLE} — ${DOC_FORM_STRINGS.HISTORY.SECTION_TITLE}`} patient={mergedPatient} />

        <div style={{ padding: "18px 40px 0" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e", marginBottom: 14 }}>{DOC_FORM_STRINGS.HISTORY.SECTION_TITLE}</div>
          <div style={{ background: "#fff", border: "1.5px solid #e8e4dc", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
             {historyFields.map(({ key, label }, i, arr) => {
               const val = history[key as keyof HistoryData];
              return (
                <div key={key.toString()} style={{ display: "flex", borderBottom: i < arr.length - 1 ? "1px solid #f0ece6" : "none" }}>
                  <div style={{ width: 160, padding: "10px 14px", background: "#f8f6f1", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, flexShrink: 0 }}>
                    {label.split('?')[0]}?
                  </div>
                  <div style={{ padding: "10px 14px", fontSize: 12, color: val ? "#333" : "#ccc", lineHeight: 1.55, fontStyle: val ? "normal" : "italic" }}>
                    {val || DOC_FORM_STRINGS.GENERAL.NOT_ANSWERED}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageShell>
    </div>
  );
};
