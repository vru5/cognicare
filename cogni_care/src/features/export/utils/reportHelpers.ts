import { PILLARS_CONFIG } from "../constants/pillars";
import { STATUS_IMPROVING, STATUS_WORSENING, STATUS_STABLE_CAPS } from "../constants/report";

/**
 * Status styling configuration based on clinical analysis status.
 * SOLID: Extracts status styling logic from the presentation component.
 */
export const getStatusConfig = (status: string) => {
  switch (status) {
    case "improving": 
      return { color: "#059669", bg: "#f0fdf4", label: STATUS_IMPROVING };
    case "worsening": 
      return { color: "#e11d48", bg: "#fff1f2", label: STATUS_WORSENING };
    default: 
      return { color: "#d97706", bg: "#fffbeb", label: STATUS_STABLE_CAPS };
  }
};

/**
 * Helper to fetch pillar-specific configuration (color, icon) for UI rendering.
 * DRY: Centralizes pillar lookup logic.
 */
export const getPillarInfo = (pillarName: string) => {
  const cfg = PILLARS_CONFIG.find(p => 
    p.label.toLowerCase() === pillarName.toLowerCase() || 
    p.key.toLowerCase() === pillarName.toLowerCase()
  );
  return cfg || { color: "#64748b", icon: "📋" };
};
