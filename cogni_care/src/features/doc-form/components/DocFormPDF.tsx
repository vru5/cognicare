import React from "react";
import "@/features/export/styles/ReportTemplate.css";
import { calculateSeverityScore } from "../utils/scoring";

// Modular Page components
import { SymptomPart1Page } from "./docFormPdfPages/SymptomPart1Page";
import { SymptomPart2Page } from "./docFormPdfPages/SymptomPart2Page";
import { PatientHistoryPage } from "./docFormPdfPages/PatientHistoryPage";
import { TesCriteriaPage } from "./docFormPdfPages/TesCriteriaPage";
import { SummaryConcernsPage } from "./docFormPdfPages/SummaryConcernsPage";
import { DocFormTOCPage } from "./docFormPdfPages/DocFormTOCPage";
import { DocFormPDFData } from "../types/docPdf";
import { PatientDetails } from "../types/docForm";

/**
 * DocFormPDF - Main Container for the 6-page clinical navigation report.
 * This component orchestrates data calculation and composes the individual pages.
 */
export default function DocFormPDF({ data }: { data: DocFormPDFData }) {
  const { 
    patient, 
    tes, 
    symptoms, 
    history, 
    concerns, 
    aiHistoryGrade = null 
  } = data;

  // 1. Data Merging & Preparation
  const mergedPatient: PatientDetails = {
    ...patient,
    name: tes?.name || patient?.name || "",
    age: tes?.age || patient?.age || "",
    consultant: tes?.consultant || patient?.consultant || "",
    evaluationDate: tes?.evalDate || patient?.evaluationDate || ""
  };

  const totalPages = 6;
  const scoreData = calculateSeverityScore(symptoms, history, tes, aiHistoryGrade);

  return (
    <div 
      className="report-page-container" 
      style={{ 
        background: "#f0ede6", 
        padding: 0, 
        fontFamily: "'Lora','Georgia',serif" 
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;0,800;1,400&display=swap');
      `}</style>

      {/* Page 1: Table of Contents */}
      <DocFormTOCPage 
        patient={mergedPatient} 
        pageNum={1} 
        totalPages={totalPages} 
      />

      {/* Page 2: Symptom Checklist (1/2) */}
      <SymptomPart1Page 
        patient={patient} 
        mergedPatient={mergedPatient} 
        pageNum={2}
        totalPages={totalPages} 
        symptoms={symptoms} 
        presentCount={scoreData.presentCount} 
      />

      {/* Page 3: Symptom Checklist (2/2) */}
      <SymptomPart2Page 
        patient={patient} 
        mergedPatient={mergedPatient} 
        pageNum={3}
        totalPages={totalPages} 
        symptoms={symptoms} 
      />

      {/* Page 4: Patient History */}
      <PatientHistoryPage 
        patient={patient} 
        mergedPatient={mergedPatient} 
        pageNum={4}
        totalPages={totalPages} 
        history={history} 
      />

      {/* Page 5: TES Criteria Assessment */}
      <TesCriteriaPage 
        patient={patient} 
        mergedPatient={mergedPatient} 
        pageNum={5}
        totalPages={totalPages} 
        tes={tes} 
      />

      {/* Page 6: Severity & Concerns */}
      <SummaryConcernsPage 
        patient={patient} 
        mergedPatient={mergedPatient} 
        pageNum={6}
        totalPages={totalPages} 
        scoreData={scoreData} 
        concerns={concerns} 
        aiHistoryGrade={aiHistoryGrade} 
      />
    </div>
  );
}
