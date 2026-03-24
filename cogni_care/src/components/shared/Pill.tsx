import React from "react";
import { AiBadge } from "./AiBadge";

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  showBadge?: boolean;
  activeColor?: string;
}

/**
 * A reusable, premium pill-style button for selection and tagging.
 * Custom styled to match the CogniCare design system.
 */
export const Pill: React.FC<PillProps> = ({ label, active, onClick, showBadge, activeColor = "#0ea5e9" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-[13px] transition-all flex items-center gap-2 border-2 ${active ? 'font-bold shadow-sm' : 'border-slate-100 bg-white text-slate-500 font-medium hover:border-slate-200'}`}
    style={active ? { borderColor: activeColor, backgroundColor: `${activeColor}10`, color: activeColor } : {}}
  >
    {label}
    {showBadge && active && <AiBadge />}
  </button>
);
