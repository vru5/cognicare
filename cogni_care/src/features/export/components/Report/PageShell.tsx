import React from "react";
import { format } from "date-fns";
import { PageShellProps } from "../../types/props";
import { TEXT_MONITORING, TEXT_CONFIDENTIAL, LABEL_PATIENT, LABEL_PAGE, LABEL_OF } from "../../constants/report";

export const PageShell: React.FC<PageShellProps> = ({
  children,
  pageNum,
  totalPages,
  patientName,
  patientId
}) => (
  <div className="report-page">
    <div style={{ position: "relative", zIndex: 1, minHeight: '1040px' }}>{children}</div>
    <div className="report-footer">
      <span>{TEXT_MONITORING} · {TEXT_CONFIDENTIAL} · {format(new Date(), "dd MMM yyyy")}</span>
      <span>{LABEL_PATIENT} {patientName} · {patientId}</span>
      <span>{LABEL_PAGE} {pageNum} {LABEL_OF} {totalPages}</span>
    </div>
  </div>
);
