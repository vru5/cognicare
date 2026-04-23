"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ReportTemplate } from "@/features/export/components/ReportTemplate";
import { getProfessionalReportData } from "@/features/export/services/exportService";
import { generatePdfFromElement } from "@/features/export/services/pdfService";
import { ReportData } from "@/features/export/types/report";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { 
  LOADING_REPORT, 
  ERROR_LOAD_REPORT, 
  CLOSE_WINDOW, 
  LIVE_REVIEW_SUBTITLE, 
  PROCESSING, 
  DOWNLOAD_PDF, 
  FOOTER_BRANDING 
} from "@/features/export/constants/reportPage";


export default function ClinicalReportPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const dateA = searchParams.get("dateA");
  const dateB = searchParams.get("dateB");

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      if (!patientId || !dateA || !dateB) return;
      try {
        const result = await getProfessionalReportData(patientId, new Date(dateA), new Date(dateB));
        setData(result);
      } catch (err) {
        console.error("Failed to load report data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId, dateA, dateB]);

  const handleDownload = async () => {
    if (!reportRef.current || !data || isDownloading) return;
    setIsDownloading(true);
    try {
      await generatePdfFromElement(
        reportRef.current,
        `Clinical-Report-${data.patient.id}-${format(new Date(), "ddMMMyy")}.pdf`,
        setStatus
      );
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
      setStatus("");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          {LOADING_REPORT}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <p className="text-red-500 font-bold">{ERROR_LOAD_REPORT}</p>
        <button onClick={() => window.close()} className="text-primary underline text-sm font-bold">
          {CLOSE_WINDOW}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ccc8c0] pb-20 relative">
      {/* Dynamic Controls Header */}
      <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex items-center justify-between shadow-sm no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.close()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">
              {data.patient.name}
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              {LIVE_REVIEW_SUBTITLE}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/30 disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{status || PROCESSING}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{DOWNLOAD_PDF}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Report View */}
      <div className="pt-10">
        <ReportTemplate ref={reportRef} data={data} />
      </div>

      {/* Footer Branding */}
      <footer className="mt-20 py-10 border-t border-black/5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500/50 cursor-default select-none">
        {FOOTER_BRANDING}
      </footer>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
