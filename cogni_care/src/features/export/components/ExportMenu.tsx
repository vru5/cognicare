import React, { useState, useRef, useEffect, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import { Download, FileText, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfessionalReportData } from "../services/exportService";
import { generatePdfFromElement } from "../services/pdfService";
import { ReportTemplate } from "./ReportTemplate";
import { ReportData } from "../types/report";
import { ExportMenuProps } from "../types/props";
import { EXPORT_STRINGS } from "../constants/exportStrings";

export default function ExportMenu({ patientId, startDate, endDate, joinedAt, accentColor, majorSymptoms, hasDataInRange, hasOneMonthData }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const cacheKey = useMemo(() => {
    return `${patientId}-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}`;
  }, [patientId, startDate, endDate]);

  const [cachedKey, setCachedKey] = useState<string | null>(null);

  const handleProfessionalDownload = async () => {
    if (isGenerating) return;
    setIsOpen(false);
    setIsGenerating(true);

    try {
      let data = reportData;
      if (data && cachedKey === cacheKey) {
        setGeneratingStatus(EXPORT_STRINGS.MENU.STATUS_CACHED);
      } else {
        setGeneratingStatus(EXPORT_STRINGS.MENU.STATUS_ANALYZING);
        data = await getProfessionalReportData(patientId, startDate, endDate, majorSymptoms);
        if (!data) throw new Error(EXPORT_STRINGS.MENU.ITEM_DOWNLOAD_AI); 
        setReportData(data);
        setCachedKey(cacheKey);
      }

      setGeneratingStatus(EXPORT_STRINGS.MENU.STATUS_CREATING_PDF);

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
          alert(`${EXPORT_STRINGS.MENU.ERROR_PDF_CAPTURE}: ${msg}. Please try again.`);
        } finally {
          setIsGenerating(false);
          setGeneratingStatus(EXPORT_STRINGS.MENU.STATUS_COMPLETE);
          setTimeout(() => setGeneratingStatus(""), 3000);
        }
      }, 1000);
    } catch (error) {
      console.error("Export Error:", error);
      alert(EXPORT_STRINGS.MENU.ITEM_DOWNLOAD_AI); 
      setIsGenerating(false);
      setGeneratingStatus("");
    }
  };

  const canExportAi = hasDataInRange && (majorSymptoms?.topSymptoms?.length ?? 0) > 0;

  const menuItems = [
    {
      label: EXPORT_STRINGS.MENU.ITEM_DOWNLOAD_AI,
      icon: Download,
      disabled: !canExportAi,
      tooltip: !canExportAi ? "No logs in selected period" : undefined,
      onClick: handleProfessionalDownload,
    },
    {
      label: EXPORT_STRINGS.MENU.ITEM_EXPORT_FORM,
      icon: FileText,
      disabled: !hasOneMonthData,
      tooltip: !hasOneMonthData ? EXPORT_STRINGS.MENU.TOOLTIP_LOGS : undefined,
      onClick: () => {
        setIsOpen(false);
        router.push(`/insights/doc-form?patientId=${patientId}`);
      },
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isGenerating}
        className={cn(
          "flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-[#0A4B75] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30",
          isOpen && "ring-2 ring-white/40 ring-offset-2",
          isGenerating && "opacity-80 cursor-wait"
        )}
      >
        {isGenerating || (generatingStatus === EXPORT_STRINGS.MENU.STATUS_COMPLETE) ? (
          <>
            {isGenerating && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>{generatingStatus || EXPORT_STRINGS.MENU.STATUS_EXPORTING}</span>
          </>
        ) : (
          <>
            <span>{EXPORT_STRINGS.MENU.LABEL_EXPORT}</span>
            <ChevronDown 
              className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")} 
            />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-slate-900/10 backdrop-blur-md">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.disabled ? undefined : item.onClick}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-sm transition-colors text-left group",
                  item.disabled
                    ? "opacity-60 cursor-not-allowed bg-slate-50/50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <div className="flex items-start gap-3">
                  <item.icon className={cn("w-4 h-4 mt-0.5", !item.disabled && "text-slate-400 group-hover:text-primary transition-colors")} />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold tracking-tight leading-none">{item.label}</span>
                    {item.disabled && item.tooltip && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded w-fit">
                        {item.tooltip}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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
