import React, { forwardRef } from "react";
import { ReportTemplateProps } from "../types/report";
import { SummaryPage } from "./Report/SummaryPage";
import { AIInsightsPage } from "./Report/AIInsightsPage";
import { NhsGuidancePage } from "./Report/NhsGuidancePage";
import { MemoPage } from "./Report/MemoPage";
import { TOCPage } from "./Report/TOCPage";
import "../styles/ReportTemplate.css";

/**
 * ReportTemplate is the main container for the professional PDF report.
 * It assembles distinct pages into a single captureable element.
 */
export const ReportTemplate = forwardRef<HTMLDivElement, ReportTemplateProps>(
  ({ data }, ref) => {
    const { ai, patient, summary, period } = data;
    
    // Pagination Logic: Including TOC (+1) and splitting AI Insights if needed
    const needsInsightSplit = (ai.criticalRisks || []).length > 2;
    const totalPages = needsInsightSplit ? 6 : 5;

    return (
      <div ref={ref} className="report-page-container" style={{ background: "#ccc8c0", minHeight: "100vh", padding: "32px 0", position: "relative" }}>
        
        {/* Container for pages to match styling */}
        <div style={{ maxWidth: 990, margin: "0 auto", padding: "0 20px" }}>
          
          {/* Page 1: Table of Contents */}
          <TOCPage data={data} pageNum={1} totalPages={totalPages} />

          {/* Page 2: 6-Month Summary & Trend Analysis */}
          <SummaryPage data={data} pageNum={2} totalPages={totalPages} />

          {/* Page 3: AI Clinical Insights (Main) */}
          <AIInsightsPage 
            patient={patient} 
            ai={ai} 
            summary={summary} 
            period={period} 
            pageNum={3}
            totalPages={totalPages}
          />

          {/* Page 4: AI Clinical Insights (Continuation - conditional) */}
          {needsInsightSplit && (
            <AIInsightsPage 
              patient={patient} 
              ai={ai} 
              summary={summary} 
              period={period} 
              pageNum={4}
              totalPages={totalPages}
              isContinuation={true}
            />
          )}

          {/* Page 5 (or 4): AI-Synthesized NHS Guidance */}
          <NhsGuidancePage 
            data={data} 
            pageNum={needsInsightSplit ? 5 : 4} 
            totalPages={totalPages} 
          />

          {/* Page 6 (or 5): Professional Evaluation & Clinician Memo */}
          <MemoPage 
            data={data} 
            pageNum={needsInsightSplit ? 6 : 5} 
            totalPages={totalPages} 
          />
        </div>
      </div>
    );
  }
);

ReportTemplate.displayName = "ReportTemplate";
