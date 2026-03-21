import React from "react";
import { PageShell } from "./PageShell";
import { Stethoscope, AlertCircle, ClipboardList } from "lucide-react";
import { MemoPageProps } from "../../types/props";
import { TITLE_PROFESSIONAL_MEMO, SUBTITLE_MEMO, LABEL_NOTICE, TEXT_MEMO_DISCLAIMER, TEXT_MEMO_PURPOSE, TITLE_CARER_NOTES, LABEL_SIGNATURE, TEXT_SYNTHESIZED_BY, TEXT_VERSION } from "../../constants/report";

export const MemoPage: React.FC<MemoPageProps> = ({ data }) => {
  const { patient, summary } = data;

  return (
    <PageShell pageNum={5} totalPages={5} patientName={patient.name} patientId={patient.id}>
      <div className="pro-header" style={{
        background: '#1a1a2e',
        padding: '24px 40px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 15
      }}>
        <Stethoscope size={28} color="#5fa8d3" />
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{TITLE_PROFESSIONAL_MEMO}</h2>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            {SUBTITLE_MEMO}
          </div>
        </div>
      </div>
      <main className="report-body">
        <div className="pro-disclaimer">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>{LABEL_NOTICE}</strong> {TEXT_MEMO_DISCLAIMER} {summary.diagnosisDate}.
            {TEXT_MEMO_PURPOSE}
          </div>
        </div>

        <div style={{ border: "1px solid #e8e4dc", borderRadius: 15, overflow: "hidden" }}>
          <div style={{
            background: "#f8f6f1",
            padding: "12px 20px",
            borderBottom: "1px solid #e8e4dc"
          }}>
            <h3 style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#1a1a2e",
              display: "flex",
              gap: 8,
              alignItems: "center"
            }}>
              <ClipboardList size={18} /> {TITLE_CARER_NOTES}
            </h3>
          </div>
          <div style={{ padding: 25, height: 420, background: "#fff" }}>
            {[...Array(16)].map((_, i) => (
              <div key={i} style={{ height: 25, borderBottom: "1px dashed #eee" }} />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ width: 250 }}>
            <div style={{ height: 50, borderBottom: "1px solid #ccc" }} />
            <div style={{ fontSize: 9, color: "#999", marginTop: 5, fontWeight: 700 }}>
              {LABEL_SIGNATURE}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>
            {TEXT_SYNTHESIZED_BY}<br />{TEXT_VERSION}
          </div>
        </div>
      </main>
    </PageShell>
  );
};
