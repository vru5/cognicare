import React, { useState, useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Download, FileText, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfessionalReportData } from "../services/exportService";
import { generatePdfFromElement } from "../services/pdfService";
import { ReportTemplate } from "./ReportTemplate";
import { ReportData } from "../types/report";
import { ExportMenuProps } from "../types/props";
import { MENU_LABEL_EXPORT, MENU_STATUS_EXPORTING, MENU_STATUS_ANALYZING, MENU_STATUS_CACHED, MENU_STATUS_CREATING_PDF, MENU_STATUS_COMPLETE, MENU_ITEM_DOWNLOAD_AI, MENU_ITEM_EXPORT_FORM, ERROR_FETCH_DATA, ERROR_PDF_CAPTURE, ERROR_GENERATE_REPORT } from "../constants/menu";

export default function ExportMenu({ patientId, dateA, dateB }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Generate a unique cache key for the current inputs
  const cacheKey = useMemo(() => {
    return `${patientId}-${dateA.toISOString().split('T')[0]}-${dateB.toISOString().split('T')[0]}`;
  }, [patientId, dateA, dateB]);

  // 2. Track the key used for the currently stored reportData
  const [cachedKey, setCachedKey] = useState<string | null>(null);

  const handleProfessionalDownload = async () => {
    if (isGenerating) return;
    setIsOpen(false);
    setIsGenerating(true);

    try {
      let data = reportData;

      // 3. Skip API call if we already have the data for this specific selection
      if (data && cachedKey === cacheKey) {
        setGeneratingStatus(MENU_STATUS_CACHED);
      } else {
        setGeneratingStatus(MENU_STATUS_ANALYZING);
        data = await getProfessionalReportData(patientId, dateA, dateB);
        if (!data) throw new Error(ERROR_FETCH_DATA);
        
        setCachedKey(cacheKey);
      }
      
      setGeneratingStatus(MENU_STATUS_CREATING_PDF);

      setTimeout(async () => {
        try {
          if (reportRef.current && data) {
            await generatePdfFromElement(
              reportRef.current, 
              `Symptom-Report-${data.patient.id}-${format(new Date(), "dd-MM-yyyy")}.pdf`,
              setGeneratingStatus
            );
          }
        } catch (innerError: unknown) {
          console.error("PDF Capture Error:", innerError);
          const msg = innerError instanceof Error ? innerError.message : String(innerError);
          alert(`${ERROR_PDF_CAPTURE}: ${msg}. Please try again.`);
        } finally {
          setIsGenerating(false);
          setGeneratingStatus(MENU_STATUS_COMPLETE);
          setTimeout(() => setGeneratingStatus(""), 3000);
        }
      }, 1000);

    } catch (error) {
      console.error("Export Error:", error);
      alert(ERROR_GENERATE_REPORT);
      setIsGenerating(false);
      setGeneratingStatus("");
    }
  };

  const menuItems = [
    {
      label: MENU_ITEM_DOWNLOAD_AI,
      icon: Download,
      onClick: handleProfessionalDownload,
    },
    {
      label: MENU_ITEM_EXPORT_FORM,
      icon: FileText,
      onClick: () => {
        console.log("Exporting doc form...");
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isGenerating}
        className={cn(
          "flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-[#0A4B75] text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-primary/20",
          isOpen && "ring-2 ring-primary/40 ring-offset-2",
          isGenerating && "opacity-80 cursor-wait"
        )}
      >
        {isGenerating || (generatingStatus === MENU_STATUS_COMPLETE) ? (
          <>
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{generatingStatus || MENU_STATUS_EXPORTING}</span>
          </>
        ) : (
          <>
            <span>{MENU_LABEL_EXPORT}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-slate-900/10 backdrop-blur-md">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors text-left"
              >
                <item.icon className="w-5 h-5 opacity-60" />
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Template for PDF capture - keep in DOM but invisible to user */}
      {reportData && (
        <div 
          style={{ position: "fixed", top: 0, left: "-9999px", opacity: 0, pointerEvents: "none", zIndex: -100 }}
        >
          <ReportTemplate ref={reportRef} data={reportData} />
        </div>
      )}
    </div>
  );
}
