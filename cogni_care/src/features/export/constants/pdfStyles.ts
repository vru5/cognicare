/**
 * Safe CSS for PDF Generation
 * These styles use only standard HEX/RGB colors to ensure compatibility with html2canvas.
 */
export const PDF_REPORT_STYLES = `
  .report-page-container { display: flex; flex-direction: column; align-items: center; background-color: #f3f4f6; padding: 40px 0; }
  .report-page { width: 950px; min-height: 1344px; background-color: #ffffff; font-family: 'Inter', system-ui, -apple-system, sans-serif; position: relative; overflow: hidden; box-sizing: border-box; }
  .report-header { background: #1a1a2e; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); padding: 26px 40px 22px; display: flex; justify-content: space-between; align-items: flex-start; color: #ffffff; }
  .header-badge { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg, #5fa8d3, #3d6b8f); display: flex; align-items: center; justify-content: center; font-size: 17px; }
  .header-subtitle { color: rgba(255,255,255,0.45); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; }
  .header-title { color: #ffffff; font-size: 12px; font-weight: 700; }
  .patient-name { color: #ffffff; font-size: 20px; font-weight: 800; line-height: 1.2; margin-top: 5px; }
  .patient-meta { color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 3px; }
  .report-scope-box { background: rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 16px; border: 1px solid rgba(255,255,255,0.12); text-align: right; }
  .scope-label { color: #5fa8d3; font-size: 12px; font-weight: 800; }
  .scope-count { color: rgba(255,255,255,0.4); font-size: 9px; margin-top: 3px; }
  .report-body { padding: 30px 40px; }
  .stats-grid { display: flex; background: #f8f6f1; border-radius: 12px; border: 1.5px solid #e8e4dc; overflow: hidden; margin-bottom: 30px; }
  .stat-item { flex: 1; text-align: center; padding: 12px 8px; border-right: 1px solid #e8e4dc; }
  .stat-item:last-child { border-right: none; }
  .stat-label { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
  .stat-value { font-size: 17px; font-weight: 900; }
  .section-title { font-size: 14px; font-weight: 800; color: #1a1a2e; margin-bottom: 15px; }
  .trend-table { background: #ffffff; border: 1.5px solid #e8e4dc; border-radius: 12px; overflow: hidden; }
  .trend-header { display: flex; background: #f8f6f1; padding: 8px 16px; border-bottom: 1px solid #e8e4dc; font-size: 10px; color: #999; font-weight: 700; text-transform: uppercase; }
  .trend-row { display: flex; align-items: center; padding: 10px 16px; border-bottom: 1px solid #f0ece6; }
  .insight-card { background: #f8f6f1; border-radius: 10px; padding: 12px; border-left-width: 4px; border-left-style: solid; }
  .insight-title { font-size: 11px; font-weight: 800; color: #1a1a2e; }
  .insight-body { margin: 0; font-size: 10px; color: #555; line-height: 1.5; }
  .report-footer { position: absolute; bottom: 0; left: 0; right: 0; border-top: 1px solid #eeeeee; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #bbbbbb; }
  .radar-section { display: flex; gap: 20px; margin-bottom: 30px; }
  .comp-insight-card { background: #f8f6f1; padding: 10px; border-radius: 8px; border-left-width: 2px; border-left-style: solid; }
  .comp-pillar-card { margin-bottom: 10px; background: #fdfcfa; border: 1px solid #e8e4dc; border-radius: 8px; padding: 8px 12px; }
  .pro-header { background: #1a1a2e; padding: 22px 40px; color: #ffffff; }
  .pro-disclaimer { background: #fffbf0; border: 1px solid #f0d080; border-radius: 10px; padding: 12px; font-size: 10.5px; color: #a07830; margin-bottom: 25px; display: flex; gap: 10px; }
  .points-card { background: #1a1a2e; border-radius: 15px; padding: 20px; color: #ffffff; }
`;
