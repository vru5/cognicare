import React from "react";
import { 
  PdfPageShellProps, 
  PdfCheckMarkProps, 
  PdfTrendBadgeProps, 
  PdfDurationBadgeProps 
} from "../types/docForm";

export const PageShell: React.FC<PdfPageShellProps> = ({ children, pageNum, totalPages, patient }) => (
  <div style={{
    width: 794, minHeight: 1123, background: "#fff",
    fontFamily: "'Lora','Georgia',serif",
    position: "relative", marginBottom: 32,
    boxSizing: "border-box",
  }}>
    {children}
    {/* Page footer */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      borderTop: "1px solid #eee", padding: "10px 40px",
      display: "flex", justifyContent: "space-between",
      fontSize: 10, color: "#bbb", letterSpacing: 0.4,
    }}>
      <span>CTE Health Monitor · Doctor Navigation Form · Confidential</span>
      <span>{patient?.name || "Patient"} · {patient?.id || "N/A"}</span>
      <span>Page {pageNum} of {totalPages}</span>
    </div>
  </div>
);

export const PdfSectionTag = ({ label, color = "#1a1a2e" }: { label: string, color?: string }) => (
  <span style={{ 
    background: color, color: "#fff", 
    padding: "0 6px", borderRadius: 4, 
    fontSize: 9, fontWeight: 900, 
    marginRight: 10, letterSpacing: 0.5,
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    height: "18px", flexShrink: 0
  }}>
    {label}
  </span>
);

export const CheckMark: React.FC<PdfCheckMarkProps> = ({ checked }) => (
  <div style={{
    width: 14, height: 14, borderRadius: 3,
    border: `1.5px solid ${checked ? "#3d6b8f" : "#ccd5e0"}`,
    background: checked ? "#3d6b8f" : "#fff",
    position: "relative", display: "inline-flex", flexShrink: 0
  }}>
    {checked && (
      <div style={{
        position: "absolute", top: "40%", left: "54%",
        width: 8, height: 4,
        borderLeft: "2px solid white",
        borderBottom: "2px solid white",
        transform: "translate(-50%, -50%) rotate(-45deg)",
      }} />
    )}
  </div>
);

export const TrendBadge: React.FC<PdfTrendBadgeProps> = ({ trend }) => {
  const map: Record<string, [string, string, string]> = {
    "worse": ["Getting Worse", "#c0674a", "#fdf1ed"],
    "same": ["Staying Same", "#888", "#f5f5f5"],
    "improving": ["Improving", "#2e8b6e", "#edf7f4"]
  };
  const [label, col, bg] = map[trend] || ["—", "#ccc", "#fff"];
  return (
    <span style={{
      display: "inline-block", width: 90, height: 16,
      background: bg, borderRadius: 12, border: `1px solid ${col}40`,
      textAlign: "center", fontSize: 8, fontWeight: 900, color: col,
      textTransform: "uppercase", lineHeight: "13px",
      paddingTop: 0, paddingBottom: 3, boxSizing: "border-box",
      verticalAlign: "middle"
    }}>
      {label}
    </span>
  );
};

export const DurationBadge: React.FC<PdfDurationBadgeProps> = ({ duration }) => {
  const isLong = duration === "6months+";
  return (
    <span style={{
      display: "inline-block", width: 75, height: 16,
      background: isLong ? "#d8f3dc" : "#e0eafc", borderRadius: 12,
      border: `1px solid ${isLong ? "#2d6a4f" : "#1a3a5a"}20`,
      textAlign: "center", fontSize: 8, fontWeight: 900,
      color: isLong ? "#2d6a4f" : "#1a3a5a",
      textTransform: "uppercase", lineHeight: "13px",
      paddingTop: 0, paddingBottom: 3, boxSizing: "border-box",
      verticalAlign: "middle"
    }}>
      {isLong ? "6 MONTHS+" : "RECENT"}
    </span>
  );
};
