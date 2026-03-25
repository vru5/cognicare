import React, { Suspense } from "react";
import DocFormView from "@/features/doc-form/components/DocFormView";

export default function DocFormPage() {
  return (
    <div className="min-h-screen text-foreground pt-safe pb-safe">
      <Suspense fallback={<div className="p-8 text-center text-primary">Loading Document Form...</div>}>
        <DocFormView />
      </Suspense>
    </div>
  );
}
