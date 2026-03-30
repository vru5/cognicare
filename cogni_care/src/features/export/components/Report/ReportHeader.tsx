import React from "react";
import { format } from "date-fns";
import { ReportHeaderProps } from "../../types/props";
import { LABEL_ID, LABEL_AGE, LABEL_PERIOD, LABEL_SINCE, LABEL_LOGS_SUFFIX, LABEL_GENERATED } from "../../constants/report";

export const ReportHeader: React.FC<ReportHeaderProps> = ({ 
  title, 
  subtitle, 
  patient, 
  summary, 
  periodInfo 
}) => (
  <header style={{ 
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', 
    padding: '38px 40px 32px', 
    color: '#fff', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ 
          width: 42, 
          height: 42, 
          borderRadius: 12, 
          background: 'rgba(255,255,255,0.08)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <img src="/images/cogni-care-logo.svg" alt="CogniCare" style={{ width: 24, height: 24, objectFit: 'contain' }} />
        </div>
        <div>
           <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>{title}</div>
           <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>{subtitle}</div>
        </div>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>{patient.name}</h1>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontWeight: 600 }}>
        {LABEL_ID} {patient.id}{patient.age ? ` · ${LABEL_AGE} ${patient.age}` : ''}
      </div>
    </div>
    <div style={{ 
      background: 'rgba(255,255,255,0.06)', 
      border: '1px solid rgba(255,255,255,0.12)', 
      borderRadius: 16, 
      padding: '16px 24px', 
      textAlign: 'right', 
      minWidth: 160 
    }}>
      {periodInfo ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>{periodInfo.label}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#5fa8d3', marginTop: 4 }}>{periodInfo.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{periodInfo.sub}</div>
          </div>
          
          {(periodInfo.patientCount !== undefined || periodInfo.carerCount !== undefined) && (
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: 14, 
              padding: '10px 18px',
              display: 'flex',
              gap: 20,
              minWidth: 180,
              justifyContent: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 2 }}>PATIENT</div>
                 <div style={{ fontSize: 16, fontWeight: 900, color: '#5fa8d3' }}>{periodInfo.patientCount || 0} logs</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' }} />
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 2 }}>CARER</div>
                 <div style={{ fontSize: 16, fontWeight: 900, color: '#2ecc71' }}>{periodInfo.carerCount || 0} logs</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>{LABEL_PERIOD}</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#5fa8d3', marginTop: 4 }}>{LABEL_SINCE} {summary.diagnosisDate}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{summary.totalLogs} {LABEL_LOGS_SUFFIX}</div>
        </>
      )}
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{LABEL_GENERATED} {format(new Date(), 'd MMM yyyy')}</div>
    </div>
  </header>
);
