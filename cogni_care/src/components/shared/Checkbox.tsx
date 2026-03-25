import React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange?: () => void;
  className?: string;
  checkedColor?: string;
}

/**
 * A reusable, premium checkbox component for clinical forms.
 * Custom styled to match the CogniCare design system.
 */
export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, className = "", checkedColor = "#0ea5e9" }) => (
  <div
    onClick={onChange}
    className={`w-[20px] h-[20px] rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all duration-200 ${checked ? 'scale-105 shadow-md' : 'border-[#ced4da] bg-white hover:border-[#adb5bd]'} ${className}`}
    style={checked ? { backgroundColor: checkedColor, borderColor: checkedColor, boxShadow: `0 4px 12px ${checkedColor}40` } : {}}
  >
    {checked && <span className="text-white text-[12px] font-black leading-none">✓</span>}
  </div>
);
