import React, { forwardRef } from "react";
import { ReportData } from "../types/report";
import { SummaryPage } from "./Report/SummaryPage";
import { AIInsightsPage } from "./Report/AIInsightsPage";
import { ComparisonPage } from "./Report/ComparisonPage";
import { CarePlanPage } from "./Report/CarePlanPage";
import { MemoPage } from "./Report/MemoPage";
import "../styles/ReportTemplate.css";

/**
 * ReportTemplate is the main container for the professional PDF report.
 * It assembles 5 distinct pages into a single captureable element.
 */
export const ReportTemplate = forwardRef<HTMLDivElement, { data: ReportData }>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="report-page-container" style={{ background: "#ccc8c0", minHeight: "100vh", padding: "32px 0", position: "relative" }}>
        
        {/* Container for pages to match styling */}
        <div style={{ maxWidth: 990, margin: "0 auto", padding: "0 20px" }}>
          {/* Page 1: 6-Month Summary & Trend Analysis */}
          <SummaryPage data={data} />

          {/* Page 2: AI Clinical Insights (Dedicated Page) */}
          <AIInsightsPage patient={data.patient} ai={data.ai} summary={data.summary} />

          {/* Page 3: Comparison Analysis (Date A vs Date B) */}
          <ComparisonPage data={data} />

          {/* Page 4: Care Plan Discussion Points */}
          <CarePlanPage data={data} />

          {/* Page 5: Professional Evaluation & Clinician Memo */}
          <MemoPage data={data} />
        </div>
      </div>
    );
  }
);

ReportTemplate.displayName = "ReportTemplate";
