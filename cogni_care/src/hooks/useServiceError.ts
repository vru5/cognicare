"use client";

import { useState, useCallback } from "react";

/**
 * Hook to handle async service errors by throwing them into the React render cycle,
 * which allows GlobalErrorBoundary to catch them.
 */
export function useServiceError() {
  const [, setError] = useState();

  const handleServiceError = useCallback((error: any) => {
    console.error("[useServiceError] Captured async error:", error);
    setError(() => {
      // Throwing inside a state setter ensures React catches it in the next render
      throw error instanceof Error ? error : new Error(String(error || "Service Unavailable"));
    });
  }, []);

  return handleServiceError;
}
