import React from "react";
import { DocFormHeader } from "../DocFormHeader";
import { TesData } from "../../types/docForm";
import { TesCriteriaPageProps } from "../../types/docPdf";
import { PageShell, CheckMark, PdfSectionTag } from "../PdfComponents";
import { RHI_CRITERIA, CORE_FEATURES, SUPPORTIVE_FEATURES } from "../../constants/docFormConfig";
import { DOC_FORM_STRINGS } from "../../constants/docStrings";

export const TesCriteriaPage: React.FC<TesCriteriaPageProps> = ({
  patient,
  mergedPatient,
  totalPages,
  pageNum,
  tes,
}) => {
  return (
    <div className="report-page">
      <PageShell pageNum={pageNum} totalPages={totalPages} patient={patient}>
        <DocFormHeader title={`${DOC_FORM_STRINGS.GENERAL.DOC_FORM_TITLE} — ${DOC_FORM_STRINGS.TES.SECTION_TITLE}`} patient={mergedPatient} />

        <div style={{ padding: "18px 40px 0" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", marginBottom: 18 }}>{DOC_FORM_STRINGS.SUMMARY.SOURCES_TC} Assessment</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* A1 */}
              <div style={{ background: "#f8f6f1", border: "1.5px solid #e8e4dc", borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center" }}>
                  <PdfSectionTag label="A1" />
                  <span>{DOC_FORM_STRINGS.TES.SECTION_RHI}</span>
                </div>
                {RHI_CRITERIA.map(({ key, label }) => (
                  <div key={key} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                    <CheckMark checked={!!tes[key as keyof TesData]} /><span style={{ fontSize: 11.5, color: "#555" }}>{label}</span>
                  </div>
                ))}
                {tes.rhi_notes && <div style={{ marginTop: 10, fontSize: 11, color: "#888", fontStyle: "italic" }}>{tes.rhi_notes}</div>}
              </div>

              {/* A3 */}
              <div style={{ background: "#f8f6f1", border: "1.5px solid #e8e4dc", borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center" }}>
                  <PdfSectionTag label="A3" />
                  <span>{DOC_FORM_STRINGS.TES.SECTION_SUPPORTIVE}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
                  {SUPPORTIVE_FEATURES.map(({ key, label }) => (
                     <div key={key} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                       <CheckMark checked={!!tes[key as keyof TesData]} /><span style={{ fontSize: 11, color: "#555" }}>{label}</span>
                     </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* A2 */}
              <div style={{ background: "#f8f6f1", border: "1.5px solid #e8e4dc", borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center" }}>
                  <PdfSectionTag label="A2" />
                  <span>{DOC_FORM_STRINGS.TES.SECTION_CORE}</span>
                </div>
                {CORE_FEATURES.map(({ key, label }) => (
                  <div key={key} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                    <CheckMark checked={!!tes[key as keyof TesData]} /><span style={{ fontSize: 11.5, color: "#555" }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* A4 */}
              <div style={{ background: "#f8f6f1", border: "1.5px solid #e8e4dc", borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center" }}>
                  <PdfSectionTag label="A4" />
                  <span>{DOC_FORM_STRINGS.TES.SECTION_DURATION}</span>
                </div>
                <div style={{ fontSize: 11.5, color: tes.symptoms_12months ? "#555" : "#bbb", fontStyle: tes.symptoms_12months ? "normal" : "italic" }}>
                  {tes.symptoms_12months || DOC_FORM_STRINGS.GENERAL.NOT_RECORDED}
                </div>
              </div>

              {/* B */}
              <div style={{ background: "#f4f1f8", border: "1.5px solid #b8a8e0", borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#6b52ae", marginBottom: 12, display: "flex", alignItems: "center" }}>
                  <PdfSectionTag label="B" color="#6b52ae" />
                  <span style={{ color: "#4f3c83" }}>{DOC_FORM_STRINGS.DIAGNOSTICS.CLINICAL_COURSE} & Subtype</span>
                </div>
                <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>{DOC_FORM_STRINGS.DIAGNOSTICS.SECTION_SUBTYPE}: <b>{tes.subtype || "—"}</b></div>
                <div style={{ fontSize: 12, color: "#444" }}>{DOC_FORM_STRINGS.DIAGNOSTICS.CLINICAL_COURSE}: <b>{tes.course || "—"}</b></div>
              </div>
            </div>
          </div>

          {/* C */}
          <div style={{ background: "#fdf6e7", border: "1.5px solid #f0c96a", borderRadius: 10, padding: "16px 20px", marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#e8a838", marginBottom: 8, display: "flex", alignItems: "center" }}>
              <PdfSectionTag label="C" color="#c0674a" />
              <span style={{ color: "#d6872a" }}>{DOC_FORM_STRINGS.CTE.SECTION_TITLE}</span>
            </div>
            <div style={{ fontSize: 12, color: tes.cte_likelihood ? "#555" : "#aaa", fontStyle: tes.cte_likelihood ? "normal" : "italic" }}>
              {tes.cte_likelihood || DOC_FORM_STRINGS.CTE.NOTICE}
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
};
