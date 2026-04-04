import React from "react";
import { Activity, TrendingUp, Brain, Moon, Users, AlertTriangle, User } from "lucide-react";
import { MajorSymptom, InsightAlert } from "../../types/report";
import { format } from "date-fns";

interface MajorSymptomsReportCardProps {
  symptoms: MajorSymptom[];
  alerts: InsightAlert[];
}

export const MajorSymptomsReportCard: React.FC<MajorSymptomsReportCardProps> = ({ symptoms, alerts }) => {
  const getPillarIcon = (pillar: string) => {
    switch (pillar.toLowerCase()) {
      case 'physical': return <Activity style={{ width: 16, height: 16 }} />;
      case 'mood': return <TrendingUp style={{ width: 16, height: 16 }} />;
      case 'cognitive': return <Brain style={{ width: 16, height: 16 }} />;
      case 'sleep': return <Moon style={{ width: 16, height: 16 }} />;
      case 'social': return <Users style={{ width: 16, height: 16 }} />;
      default: return <User style={{ width: 16, height: 16 }} />;
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar.toLowerCase()) {
      case 'mood': return "#e8a838";
      case 'physical': return "#c0674a";
      case 'cognitive': return "#6b52ae";
      case 'social': return "#2e8b6e";
      case 'sleep': return "#3d6b8f";
      default: return "#1a1a2e";
    }
  };

  // Ensure exactly 5 items for visual consistency
  const displaySymptoms = [...symptoms].slice(0, 5);
  const placeholdersNeeded = Math.max(0, 5 - displaySymptoms.length);

  return (
    <div style={{ marginTop: 40 }}>
      {/* Alert Section */}
      {alerts.length > 0 && (
        <div style={{
          background: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              background: '#f56565',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#9b2c2c', textTransform: 'uppercase', letterSpacing: 1 }}>Critical Health Indicators</h3>
              <p style={{ margin: 0, fontSize: 10, color: '#c53030', fontWeight: 700 }}>High-risk patterns detected in the last 7 days</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.slice(0, 3).map((alert, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.7)',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 11,
                color: '#742a2a',
                borderLeft: '3px solid #f56565',
                fontWeight: 600
              }}>
                {alert.message}
                <span style={{ display: 'block', fontSize: 8, marginTop: 4, opacity: 0.6, fontWeight: 800 }}>
                  DETECTED: {format(new Date(alert.date), 'MMM d, p')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Major Symptoms Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 className="section-title" style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Major Symptoms</h2>
        <div style={{ fontSize: 10, color: "#666", fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.8 }}>
          Frequent indicators from recent logs (Last 7 Days)
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 12
      }}>
        {displaySymptoms.map((symptom, i) => {
          const color = getPillarColor(symptom.pillar);
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              background: symptom.isRisk ? '#fff5f5' : '#fff',
              border: `1px solid ${symptom.isRisk ? '#feb2b2' : '#e8e4dc'}`,
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fdfcfa',
                  border: `1px solid ${color}20`,
                  color: color
                }}>
                  {getPillarIcon(symptom.pillar)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#1a1a2e', textTransform: 'capitalize' }}>{symptom.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {symptom.pillar} • {symptom.source}
                  </div>
                </div>
              </div>
              <div style={{
                padding: '6px 12px',
                background: '#fdfcfa',
                border: '1px solid #e8e4dc',
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 900,
                color: color
              }}>
                LVL {symptom.severity}
              </div>
            </div>
          );
        })}

        {/* Placeholders */}
        {Array.from({ length: placeholdersNeeded }).map((_, i) => (
          <div key={`p-${i}`} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 20px',
            background: '#fdfcfa',
            border: '1px solid #f0eee8',
            borderRadius: 16,
            opacity: 0.5,
            borderStyle: 'dashed'
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#fff',
              border: '1px solid #e8e4dc'
            }} />
            <div style={{ marginLeft: 15 }}>
              <div style={{ width: 80, height: 10, background: '#e8e4dc', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ width: 50, height: 6, background: '#f0eee8', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
