import React from "react";

/**
 * A reusable AI indicator badge that follows the application's premium aesthetic.
 * Used to identify fields that were pre-filled or assisted by AI analysis.
 */
export const AiBadge: React.FC = () => (
  <span className="text-[10px] font-black text-[#1c7ed6] bg-[#e7f5ff] rounded px-1.5 py-0.5 tracking-wider uppercase border border-[#d0e4ff] shrink-0">
    AI
  </span>
);
