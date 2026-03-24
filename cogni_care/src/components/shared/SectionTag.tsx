import React from "react";

interface SectionTagProps {
  label: string;
  className?: string; // Opt-in to custom Tailwind coloring
  color?: string; // Optional hex for PDF/inline styles
  style?: React.CSSProperties; // Detailed override for PDF
}

/**
 * A reusable section tag for clinical documentation.
 * Supports both standard Tailwind styling and custom inline background colors.
 */
export const SectionTag: React.FC<SectionTagProps> = ({ 
  label, 
  className = "bg-primary/80 text-primary-foreground", 
  color,
  style
}) => (
  <span 
    className={`${className} rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide mr-2 shrink-0 h-fit inline-block leading-[1.5]`}
    style={{
      ...style,
      ...(color ? { backgroundColor: color, color: "#fff" } : {}),
    }}
  >
    {label}
  </span>
);
