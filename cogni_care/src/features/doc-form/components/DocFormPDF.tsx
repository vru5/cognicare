import React from "react";
import "@/features/export/styles/ReportTemplate.css";
import { DocFormHeader } from "./DocFormHeader";
import { SYMPTOM_ROWS, CONCERN_ITEMS, GAUGE_CONFIG, GAUGE_SEGMENTS } from "../constants/docFormConfig";
import { PageShell, CheckMark, TrendBadge, DurationBadge, PdfSectionTag } from "./PdfComponents";
import { SeverityGauge } from "./SeverityGauge";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function DocFormPDF({ data }: { data: any }) {
  const { patient = {}, tes = {}, symptoms = {}, history = {}, concerns = {}, aiHistoryGrade = null } = data || {};

  // Merge backend patient info with live form data (tes)
  const mergedPatient = {
    ...patient,
    name: tes?.name || patient?.name || "",
    age: tes?.age || patient?.age || "",
    consultant: tes?.consultant || patient?.consultant || "",
    evaluationDate: tes?.evalDate || patient?.evaluationDate || patient?.evalDate || ""
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SCORING LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const computeScore = () => {
    const symptomList = Object.values(symptoms) as any[];
    const presentCount = symptomList.filter(s => s.present).length;
    const worseCount = symptomList.filter(s => s.worse).length;
    const improvingCount = symptomList.filter(s => s.improving).length;
    const symptomScore = Math.min(Math.round(presentCount * 0.9 + worseCount * 2 - improvingCount * 0.5), 30);

    const histValues = Object.values(history) as string[];
    const filledHistory = histValues.filter(v => v?.trim()?.length > 0).length;
    let historyScore = Math.min(filledHistory * 2, 8);
    if ((history.drinking as string)?.length > 2) historyScore += 3;
    if ((history.nonPrescription as string)?.length > 2) historyScore += 2;
    if ((history.stoppedChores as string)?.length > 2) historyScore += 2;
    historyScore = Math.min(Math.round(historyScore), 15);
    const historyFinalScore = aiHistoryGrade !== null && aiHistoryGrade !== undefined ? aiHistoryGrade : historyScore;

    const rhiMet = [tes.rhi_concussions4, tes.rhi_moderate2, tes.rhi_sports6, tes.rhi_military, tes.rhi_other].filter(Boolean).length;
    const coreMet = [tes.core_cognitive, tes.core_behavioral, tes.core_mood].filter(Boolean).length;
    const supMet = [tes.sup_decline, tes.sup_delayed, tes.sup_impulsivity, tes.sup_anxiety, tes.sup_apathy, tes.sup_paranoia, tes.sup_suicidality, tes.sup_headache, tes.sup_motor].filter(Boolean).length;
    const tesScore = Math.min(Math.round(rhiMet * 5 + coreMet * 9 + Math.min(supMet * 4, 20) + (tes.symptoms_12months ? 8 : 0)), 55);

    const total = Math.min(symptomScore + historyFinalScore + tesScore, 100);
    return { total, symptomScore, historyScore: historyFinalScore, tesScore, presentCount, worseCount, rhiMet, coreMet, supMet };
  };

  const scoreData = computeScore();

  // Helper for gauge SVG
  const toRad = (d: number) => d * Math.PI / 180;
  const { CX, CY, R, IR } = GAUGE_CONFIG;
  const needleA = -180 + (scoreData.total / 100) * 180;

  const arcPath = (sa: number, ea: number, outer: number, inner: number) => {
    const lg = ea - sa > 90 ? 1 : 0;
    const x1 = CX + outer * Math.cos(toRad(sa)), y1 = CY + outer * Math.sin(toRad(sa));
    const x2 = CX + outer * Math.cos(toRad(ea)), y2 = CY + outer * Math.sin(toRad(ea));
    const x3 = CX + inner * Math.cos(toRad(ea)), y3 = CY + inner * Math.sin(toRad(ea));
    const x4 = CX + inner * Math.cos(toRad(sa)), y4 = CY + inner * Math.sin(toRad(sa));
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${outer},${outer} 0 ${lg},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} A${inner},${inner} 0 ${lg},0 ${x4.toFixed(1)},${y4.toFixed(1)} Z`;
  };

  const segs = GAUGE_SEGMENTS;

  const sources = [
    { label: "Symptom Burden", score: scoreData.symptomScore, max: 30, c: "#3d6b8f", desc: `${scoreData.presentCount} present · ${scoreData.worseCount} worsening` },
    { label: "Patient History", score: scoreData.historyScore, max: 15, c: "#6b52ae", desc: aiHistoryGrade !== null ? "✦ AI Evaluated Content" : "7/7 fields completed" },
    { label: "TES Criteria", score: scoreData.tesScore, max: 55, c: "#c0674a", desc: `RHI:${scoreData.rhiMet} · Core:${scoreData.coreMet} · Sup:${scoreData.supMet}` },
  ];

  let level, col, bg, urgency;
  if (scoreData.total >= 75) { level = "High Severity"; col = "#c0674a"; bg = "#fdf1ed"; urgency = "Requires urgent clinical attention. Multiple TES criteria met. Escalate to neurologist immediately."; }
  else if (scoreData.total >= 45) { level = "Moderate"; col = "#e8a838"; bg = "#fdf6e7"; urgency = "Significant combined burden. Specialist referral is recommended. Monitor closely."; }
  else if (scoreData.total >= 20) { level = "Mild"; col = "#3d6b8f"; bg = "#eef4f9"; urgency = "Some criteria met. Continued monitoring and full clinical assessment recommended."; }
  else { level = "Insufficient"; col = "#888"; bg = "#f8f6f1"; urgency = "Insufficient data — complete all sections for an accurate assessment."; }

  const totalPages = 5;

  return (
    <div className="report-page-container" style={{ background: "#f0ede6", padding: 0, fontFamily: "'Lora','Georgia',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;0,800;1,400&display=swap');
      `}</style>

      {/* PAGE 1: SYMPTOM checklist (PART 1) */}
      <div className="report-page">
        <PageShell pageNum={1} totalPages={totalPages} patient={patient}>
          <DocFormHeader title="Doctor Navigation Form — Symptom Report (1/2)" patient={mergedPatient} />

          <div style={{ margin: "18px 40px 0" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 4 }}>Symptom Checklist — Part 1</div>
            <div style={{ fontSize: 11, color: "#999", marginBottom: 10 }}>
              {scoreData.presentCount} symptoms marked present out of {SYMPTOM_ROWS.length} total assessed
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 10px", background: "#1a1a2e", color: "#fff", textAlign: "left", fontWeight: 700, borderRadius: "8px 0 0 0", width: 24 }}>✓</th>
                  <th style={{ padding: "8px 10px", background: "#1a1a2e", color: "#fff", textAlign: "left", fontWeight: 700 }}>Symptom</th>
                  <th style={{ padding: "8px 10px", background: "#16213e", color: "#fff", textAlign: "center", fontWeight: 700, borderLeft: "2px solid #0f3460" }}>Duration</th>
                  <th style={{ padding: "8px 10px", background: "#2e4057", color: "#fff", textAlign: "center", fontWeight: 700, borderLeft: "2px solid #0f3460", borderRadius: "0 8px 0 0" }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {SYMPTOM_ROWS.slice(0, 20).map((sym, i) => {
                  const row = symptoms[sym] || {};
                  const duration = row.sixMonths ? "6months+" : row.recent ? "recent" : null;
                  const trend = row.worse ? "worse" : row.improving ? "improving" : row.same ? "same" : null;
                  return (
                    <tr key={sym} style={{ background: i % 2 === 0 ? "#fff" : "#fafaf8", borderBottom: "1px solid #f0ece6" }}>
                      <td style={{ padding: "6px 10px", textAlign: "center", verticalAlign: "middle" }}><CheckMark checked={!!row.present} /></td>
                      <td style={{ padding: "6px 10px", color: row.present ? "#1a1a2e" : "#bbb", fontWeight: row.present ? 600 : 400, verticalAlign: "middle" }}>{sym}</td>
                      <td style={{ padding: "6px 10px", textAlign: "center", borderLeft: "2px solid #f0ece6", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          {row.present && duration && <DurationBadge duration={duration} />}
                        </div>
                      </td>
                      <td style={{ padding: "6px 10px", textAlign: "center", borderLeft: "2px solid #f0ece6", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          {row.present && trend && <TrendBadge trend={trend} />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PageShell>
      </div>

      {/* PAGE 2: SYMPTOM checklist (PART 2) */}
      <div className="report-page">
        <PageShell pageNum={2} totalPages={totalPages} patient={patient}>
          <DocFormHeader title="Doctor Navigation Form — Symptom Report (2/2)" patient={mergedPatient} />

          <div style={{ margin: "18px 40px 0" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 4 }}>Symptom Checklist — Part 2</div>
            <div style={{ fontSize: 11, color: "#999", marginBottom: 10 }}>Continued from Page 1</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 10px", background: "#1a1a2e", color: "#fff", textAlign: "left", fontWeight: 700, borderRadius: "8px 0 0 0", width: 24 }}>✓</th>
                  <th style={{ padding: "8px 10px", background: "#1a1a2e", color: "#fff", textAlign: "left", fontWeight: 700 }}>Symptom</th>
                  <th style={{ padding: "8px 10px", background: "#16213e", color: "#fff", textAlign: "center", fontWeight: 700, borderLeft: "2px solid #0f3460" }}>Duration</th>
                  <th style={{ padding: "8px 10px", background: "#2e4057", color: "#fff", textAlign: "center", fontWeight: 700, borderLeft: "2px solid #0f3460", borderRadius: "0 8px 0 0" }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {SYMPTOM_ROWS.slice(20).map((sym, i) => {
                  const row = symptoms[sym] || {};
                  const duration = row.sixMonths ? "6months+" : row.recent ? "recent" : null;
                  const trend = row.worse ? "worse" : row.improving ? "improving" : row.same ? "same" : null;
                  return (
                    <tr key={sym} style={{ background: i % 2 === 0 ? "#fff" : "#fafaf8", borderBottom: "1px solid #f0ece6" }}>
                      <td style={{ padding: "6px 10px", textAlign: "center", verticalAlign: "middle" }}><CheckMark checked={!!row.present} /></td>
                      <td style={{ padding: "6px 10px", color: row.present ? "#1a1a2e" : "#bbb", fontWeight: row.present ? 600 : 400, verticalAlign: "middle" }}>{sym}</td>
                      <td style={{ padding: "6px 10px", textAlign: "center", borderLeft: "2px solid #f0ece6", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          {row.present && duration && <DurationBadge duration={duration} />}
                        </div>
                      </td>
                      <td style={{ padding: "6px 10px", textAlign: "center", borderLeft: "2px solid #f0ece6", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          {row.present && trend && <TrendBadge trend={trend} />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PageShell>
      </div>

      {/* PAGE 3: PATIENT HISTORY */}
      <div className="report-page">
        <PageShell pageNum={3} totalPages={totalPages} patient={patient}>
          <DocFormHeader title="Doctor Navigation Form — Patient History" patient={mergedPatient} />

          <div style={{ padding: "18px 40px 0" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e", marginBottom: 14 }}>Patient History</div>
            <div style={{ background: "#fff", border: "1.5px solid #e8e4dc", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
              {(Object.entries({
                stoppedChores: "Have you stopped doing certain chores because you can't do them anymore?",
                drinking: "Are you drinking?",
                nonPrescription: "Are you taking any non-prescription drugs?",
                diet: "What is your diet like?",
                familyHistory: "Is there family history of dementia or neurological diseases?",
                supportNetwork: "What is your support network like?",
                additionalNotes: "Additional notes",
              }) as [string, string][]).map(([key, label], i, arr) => {
                const val = history[key];
                return (
                  <div key={key} style={{ display: "flex", borderBottom: i < arr.length - 1 ? "1px solid #f0ece6" : "none" }}>
                    <div style={{ width: 160, padding: "10px 14px", background: "#f8f6f1", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, flexShrink: 0 }}>
                      {label.split('?')[0]}?
                    </div>
                    <div style={{ padding: "10px 14px", fontSize: 12, color: val ? "#333" : "#ccc", lineHeight: 1.55, fontStyle: val ? "normal" : "italic" }}>
                      {val || "Not answered"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PageShell>
      </div>

      {/* PAGE 4: TES CRITERIA ASSESSMENT */}
      <div className="report-page">
        <PageShell pageNum={4} totalPages={totalPages} patient={patient}>
          <DocFormHeader title="Doctor Navigation Form — TES Criteria Assessment" patient={mergedPatient} />

          <div style={{ padding: "18px 40px 0" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", marginBottom: 18 }}>TES Criteria Assessment</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* LEFT COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* A1 */}
                <div style={{ background: "#f8f6f1", border: "1.5px solid #e8e4dc", borderRadius: 10, padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center" }}>
                    <PdfSectionTag label="A1" />
                    <span>Repetitive Head Impacts</span>
                  </div>
                  {[["rhi_concussions4", "≥4 concussions or mild TBIs"], ["rhi_moderate2", "≥2 moderate/severe TBIs"], ["rhi_sports6", "≥6 years contact sports"], ["rhi_military", "Military with combat exposure"], ["rhi_other", "Other significant RHI"]].map(([k, l]) => (
                    <div key={k} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                      <CheckMark checked={!!tes[k]} /><span style={{ fontSize: 11.5, color: "#555" }}>{l}</span>
                    </div>
                  ))}
                  {tes.rhi_notes && <div style={{ marginTop: 10, fontSize: 11, color: "#888", fontStyle: "italic" }}>{tes.rhi_notes}</div>}
                </div>

                {/* A3 */}
                <div style={{ background: "#f8f6f1", border: "1.5px solid #e8e4dc", borderRadius: 10, padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center" }}>
                    <PdfSectionTag label="A3" />
                    <span>Supportive Features</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
                    {[["sup_decline", "Documented decline"], ["sup_delayed", "Delayed onset"], ["sup_impulsivity", "Impulsivity"], ["sup_anxiety", "Anxiety"], ["sup_apathy", "Apathy"], ["sup_paranoia", "Paranoia"], ["sup_suicidality", "Suicidality"], ["sup_headache", "Headache"], ["sup_motor", "Motor impairment"]].map(([k, l]) => (
                      <div key={k} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <CheckMark checked={!!tes[k]} /><span style={{ fontSize: 11, color: "#555" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* A2 */}
                <div style={{ background: "#f8f6f1", border: "1.5px solid #e8e4dc", borderRadius: 10, padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center" }}>
                    <PdfSectionTag label="A2" />
                    <span>Core Clinical Features</span>
                  </div>
                  {[["core_cognitive", "Cognitive impairment"], ["core_behavioral", "Behavioral — explosive/violent"], ["core_mood", "Mood — depressed/hopeless"]].map(([k, l]) => (
                    <div key={k} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                      <CheckMark checked={!!tes[k]} /><span style={{ fontSize: 11.5, color: "#555" }}>{l}</span>
                    </div>
                  ))}
                </div>

                {/* A4 */}
                <div style={{ background: "#f8f6f1", border: "1.5px solid #e8e4dc", borderRadius: 10, padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center" }}>
                    <PdfSectionTag label="A4" />
                    <span>Duration</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: tes.symptoms_12months ? "#555" : "#bbb", fontStyle: tes.symptoms_12months ? "normal" : "italic" }}>
                    {tes.symptoms_12months || "Not recorded"}
                  </div>
                </div>

                {/* B */}
                <div style={{ background: "#f4f1f8", border: "1.5px solid #b8a8e0", borderRadius: 10, padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#6b52ae", marginBottom: 12, display: "flex", alignItems: "center" }}>
                    <PdfSectionTag label="B" color="#6b52ae" />
                    <span style={{ color: "#4f3c83" }}>Subtype & Course</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>Subtype: <b>{tes.subtype || "—"}</b></div>
                  <div style={{ fontSize: 12, color: "#444" }}>Course: <b>{tes.course || "—"}</b></div>
                </div>
              </div>
            </div>

            {/* C */}
            <div style={{ background: "#fdf6e7", border: "1.5px solid #f0c96a", borderRadius: 10, padding: "16px 20px", marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#e8a838", marginBottom: 8, display: "flex", alignItems: "center" }}>
                <PdfSectionTag label="C" color="#c0674a" />
                <span style={{ color: "#d6872a" }}>CTE Likelihood</span>
              </div>
              <div style={{ fontSize: 12, color: tes.cte_likelihood ? "#555" : "#aaa", fontStyle: tes.cte_likelihood ? "normal" : "italic" }}>
                {tes.cte_likelihood || "Not yet determined — requires imaging and biomarker results"}
              </div>
            </div>
          </div>
        </PageShell>
      </div>

      {/* PAGE 5: DIAGNOSSTIC SUMMARY & CONCERNS */}
      <div className="report-page">
        <PageShell pageNum={5} totalPages={totalPages} patient={patient}>
          <DocFormHeader title="Doctor Navigation Form — Severity & Concerns" patient={mergedPatient} />

          <div style={{ padding: "18px 40px 0" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", marginBottom: 16 }}>Overall Severity Score</div>
            <div style={{ background: bg, border: `1.5px solid ${col}40`, borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: "0 0 240px", textAlign: "center" }}>
                  <div style={{ width: 240, height: 130, margin: "0 auto" }}>
                    <SeverityGauge score={scoreData.total} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: col }}>{level}</div>
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 12, color: "#444", lineHeight: 1.65, marginBottom: 16, padding: "10px 14px", background: "rgba(255,255,255,.75)", borderRadius: 9, borderLeft: `4px solid ${col}` }}>
                    {urgency}
                  </div>
                  {sources.map(src => (
                    <div key={src.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#444" }}>{src.label}</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: "#bbb" }}>{src.desc}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: src.c }}>{src.score}<span style={{ fontSize: 9, color: "#ccc" }}>/{src.max}</span></span>
                        </div>
                      </div>
                      <div style={{ height: 7, background: "#e8e4dc", borderRadius: 4 }}>
                        <div style={{ height: "100%", width: `${(src.score / src.max) * 100}%`, background: src.c, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
                    {segs.map(s => (
                      <div key={s.lbl} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#666" }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: s.c }} />{s.lbl}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e", marginBottom: 12 }}>Patient Concerns — For Healthcare Provider</div>
            <div style={{ background: "#fff", border: "1.5px solid #e8e4dc", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
              {CONCERN_ITEMS.map((item, i) => {
                const checked = concerns[i];
                return (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", borderBottom: i < CONCERN_ITEMS.length - 1 ? "1px solid #f0ece6" : "none", background: checked ? "#eef4f9" : "#fff" }}>
                    <CheckMark checked={!!checked} />
                    <span style={{ fontSize: 12, color: checked ? "#1a1a2e" : "#bbb", fontWeight: checked ? 600 : 400, lineHeight: 1.5 }}>{item}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#fdf6e7", border: "1px solid #f0c96a", borderRadius: 10, padding: "14px 16px", fontSize: 11, color: "#7a5c1e", lineHeight: 1.6, textAlign: "center" }}>
              This form was generated from patient self-reported symptom data via CTE Health Monitor. It is intended to support clinical conversations and should not replace professional medical assessment.<br />
              <b>Confidential — {mergedPatient?.name} · {mergedPatient?.id} · Generated {mergedPatient?.evaluationDate}</b>
            </div>
          </div>
        </PageShell>
      </div>
    </div>
  );

}
