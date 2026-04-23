import React from "react";
import { PageShell } from "../PdfComponents";
import { DocFormHeader } from "../DocFormHeader";
import { ClipboardList, History, Search, Activity, FileText } from "lucide-react";

interface DocFormTOCPageProps {
  patient: any;
  pageNum: number;
  totalPages: number;
}

const TOC_ITEMS = [
  {
    icon: ClipboardList,
    title: "Page 2-3: Clinical Symptom Survey",
    description: "Assessment of clinical markers across Cognitive, Mood, Physical, and Sleep domains.",
  },
  {
    icon: History,
    title: "Page 4: Patient Clinical History",
    description: "Overview of traumatic brain injury history and potentially confounding medical factors.",
  },
  {
    icon: Search,
    title: "Page 5: TES Criteria Evaluation",
    description: "Systematic assessment of patient findings against official Traumatic Encephalopathy Syndrome markers.",
  },
  {
    icon: Activity,
    title: "Page 6: Clinical Severity & Care Synthesis",
    description: "Final clinical scoring and summarized concerns synthesized for professional medical review.",
  },
];

export const DocFormTOCPage: React.FC<DocFormTOCPageProps> = ({ patient, pageNum, totalPages }) => {
  return (
    <div className="report-page">
      <PageShell pageNum={pageNum} totalPages={totalPages} patient={patient}>
        <DocFormHeader 
          title="Assessment Overview" 
          patient={patient}
        />

        <div style={{ marginTop: 40, padding: "0 40px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 15, 
            marginBottom: 40,
            borderBottom: "2px solid #e2e8f0",
            paddingBottom: 20
          }}>
            <FileText size={28} color="#1a1a2e" />
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", margin: 0, fontFamily: "'Lora','Georgia',serif" }}>Clinical Roadmap</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>
            {TOC_ITEMS.map((item, idx) => (
              <div key={idx} style={{ 
                display: "flex", 
                gap: 25, 
                padding: 30, 
                backgroundColor: "#fcfaf7", 
                borderRadius: 15,
                border: "1px solid #e8e4dc"
              }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: 12, 
                  backgroundColor: "#fff", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  flexShrink: 0
                }}>
                  <item.icon size={28} color="#3d6b8f" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <h4 style={{ 
                    fontSize: 20, 
                    fontWeight: 800, 
                    color: "#1a1a2e", 
                    margin: "0 0 8px 0",
                    fontFamily: "'Lora','Georgia',serif" 
                  }}>
                    {item.title}
                  </h4>
                  <p style={{ 
                    fontSize: 15, 
                    fontWeight: 500, 
                    color: "#5c5c5c", 
                    lineHeight: 1.6, 
                    margin: 0,
                    fontFamily: "'Lora','Georgia',serif"
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: 60, 
            padding: 30, 
            backgroundColor: "#f4f7f9", 
            borderRadius: 15,
            borderLeft: "6px solid #3d6b8f"
          }}>
            <p style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: "#3d6b8f", 
              margin: 0, 
              lineHeight: 1.6,
              fontFamily: "'Lora','Georgia',serif"
            }}>
              <span style={{ fontWeight: 800 }}>PROFESSIONAL NOTE:</span> This clinical documentation is intended for use by a qualified medical consultant. All scoring and assessments provided are preliminary syntheses of symptom data and require formal clinical validation by a GP or specialist care team.
            </p>
          </div>
        </div>
      </PageShell>
    </div>
  );
};
