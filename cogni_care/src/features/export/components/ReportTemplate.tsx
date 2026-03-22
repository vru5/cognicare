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
      <div ref={ref} className="report-page-container">
        {/* Page 1: 6-Month Summary & Trend Analysis */}
        <SummaryPage data={data} />

        {/* Page 2: AI Clinical Insights (Dedicated Page) */}
        <AIInsightsPage ai={data.ai} patient={data.patient} summary={data.summary} />

        {/* Page 3: Comparison Analysis (Date A vs Date B) */}
        <ComparisonPage data={data} />

        {/* Page 4: Care Plan Discussion Points */}
        <CarePlanPage data={data} />

        {/* Page 5: Professional Evaluation & Clinician Memo */}
        <MemoPage data={data} />
      </div>
    );
  }
);

ReportTemplate.displayName = "ReportTemplate";
