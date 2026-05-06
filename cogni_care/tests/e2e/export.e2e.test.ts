/**
 * E2E Tests — Export (PDF Reports & Doctor Form)
 * Tests: AI PDF download, Doctor Assessment Form multi-step flow + PDF download
 */

import { test, expect } from "@playwright/test";
import { e2eLoginAsPatient } from "../helpers/auth.helpers";

test.setTimeout(180000); 

test.describe("Export (E2E)", () => {

  test.beforeEach(async ({ page }) => {
    // 1. Mock Doc Form Prefill
    await page.route("**/api/export/doctor-form?patientId=*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            patientDetails: { name: "Mock Patient", age: 70, consultant: "Dr. Mock", evaluationDate: "2026-05-05" },
            tes: { name: "Mock Patient", age: "70", consultant: "Dr. Mock", evalDate: "2026-05-05" },
            symptomChecks: {
              "Memory Problems": { 
                present: true, 
                sixMonths: true, 
                same: true,
                duration: "6months+", 
                trend: "staying_same" 
              }
            }
          }
        }),
      });
    });

    // 2. Mock Professional Report Data
    await page.route("**/api/export/professional", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            patient: { name: "Mock Patient", id: "PAT-123", diagnosisDate: "2025-01-01" },
            period: { dateA: "2026-04-01", dateB: "2026-05-01", entries: 10 },
            overall: {
              pillarAvg: { cognitive: 50 },
              periodPillarAvg: { cognitive: 50 },
              patientPillarAvg: { cognitive: 50 },
              carerPillarAvg: {},
              patientPillarLogs: { cognitive: 5 },
              carerPillarLogs: {},
              patientPeriodPillarLogs: { cognitive: 5 },
              carerPeriodPillarLogs: {},
              monthlyTrend: {}, patientMonthlyTrend: {}, carerMonthlyTrend: {},
              patientMonthlyLogs: {}, carerMonthlyLogs: {}, months: []
            },
            comparison: {
              scoresA: { cognitive: 40 }, scoresB: { cognitive: 50 },
              patientScoresA: { cognitive: 40 }, carerScoresA: {},
              patientScoresB: { cognitive: 50 }, carerScoresB: {},
              patientPillarLogsA: { cognitive: 2 }, carerPillarLogsA: {},
              patientPillarLogsB: { cognitive: 3 }, carerPillarLogsB: {},
              totalA: 40, totalB: 50, overallChange: 10,
              logsCountA: 2, logsCountB: 3, patientLogsA: 2, carerLogsA: 0, patientLogsB: 3, carerLogsB: 0,
              biggestWorsening: { pillar: "cognitive", label: "Cognitive", diff: 10, scoreA: 40, scoreB: 50 },
              biggestImprovement: { pillar: "mood", label: "Mood", diff: -5, scoreA: 30, scoreB: 25 },
              mostStable: { pillar: "physical", label: "Physical", diff: 0, scoreA: 20, scoreB: 20 }
            },
            ai: {
              summary: "Mock AI Summary",
              status: "stable",
              topConcern: null,
              keyFindings: [],
              criticalRisks: [],
              nhsGuidance: { clinicalAlignment: "", suggestedDiagnosticSteps: [], carersCorner: [] }
            },
            summary: {
              diagnosisDate: "2025-01-01",
              totalLogs: 10,
              patientLogsCount: 10,
              carerLogsCount: 0,
              highestBurden: { label: "Cognitive", color: "#3b82f6" },
              mostManaged: { label: "Physical", color: "#ef4444" },
              majorSymptoms: { topSymptoms: [], alerts: [] }
            }
          }
        }),
      });
    });
  });

  test("Patient can download an AI-generated professional PDF report", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Insights" }).click();
    await page.waitForURL("**/insights");

    // Open export menu
    await page.getByRole("button", { name: "Export Data" }).click();

    const downloadBtn = page.getByRole("button", { name: "Download (AI PDF)" });
    await expect(downloadBtn).toBeVisible({ timeout: 30000 });
    
    // Setting up the promise before clicking
    const downloadPromise = page.waitForEvent("download");
    await downloadBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBeTruthy();
  });

  test("Doctor Assessment Form — Step 1 (Demographics) accepts input and enables Next Step", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Insights" }).click();
    await page.waitForURL("**/insights");
    
    await page.getByRole("button", { name: "Export Data" }).click();
    await page.getByRole("button", { name: "Export Doc Form" }).click();

    // Fill demographics
    await page.getByRole("textbox", { name: "Years" }).fill("70");
    await page.getByRole("textbox", { name: "Full name" }).fill("Mock Patient");

    const memoryCheck = page.locator('div:has-text("Memory Problems")').first();
    await expect(memoryCheck).toBeVisible({ timeout: 30000 });
    
    // The mock pre-fills all required symptom info, so the button should be enabled
    const nextBtn = page.getByRole("button", { name: "Next Step" });
    await expect(nextBtn).toBeEnabled({ timeout: 30000 });
  });

  test("Doctor Assessment Form — full multi-step flow produces a downloadable PDF", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Insights" }).click();
    await page.waitForURL("**/insights");

    await page.getByRole("button", { name: "Export Data" }).click();
    await page.getByRole("button", { name: "Export Doc Form" }).click();

    // Step 1
    await page.getByRole("textbox", { name: "Years" }).fill("70");
    await page.getByRole("textbox", { name: "Full name" }).fill("Mock Patient");
    await page.getByRole("button", { name: "Next Step" }).click();

    // Step 2
    const historyPlaceholders = page.getByPlaceholder("Enter response here…");
    await historyPlaceholders.nth(0).fill("no");
    await historyPlaceholders.nth(1).fill("yes");
    await historyPlaceholders.nth(2).fill("no");
    await historyPlaceholders.nth(3).fill("normal");
    await historyPlaceholders.nth(4).fill("yes");
    await historyPlaceholders.nth(5).fill("normal");
    await page.getByRole("button", { name: "Next Step" }).click();

    // Step 3
    await page.getByText("≥4 concussions or mild TBIs").first().click();
    await page.getByText("Cognitive impairment").first().click();
    await page.getByText("Delayed onset").first().click();
    await page.getByText("Anxiety").first().click();
    
    await page.getByRole("button", { name: "Cognitive", exact: true }).click();
    await page.getByRole("button", { name: "Progressive" }).click();
    await page.getByRole("button", { name: "Next Step" }).click();

    // Step 4
    await page.getByText("I may not be able to endure a").first().click();
    await page.getByRole("button", { name: "Next Step" }).click();

    // Final Download
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PDF" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });

});
