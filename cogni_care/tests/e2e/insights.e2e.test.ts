/**
 * E2E Tests — Insights
 * Tests: Chart visibility, Range presets, AI Insight reveal, Predictive analysis reveal
 */

import { test, expect } from "@playwright/test";
import { e2eLoginAsPatient } from "../helpers/auth.helpers";

test.setTimeout(120000);

test.describe("Insights (E2E)", () => {

  test.beforeEach(async ({ page }) => {
    // Mock Eligibility
    await page.route("**/api/insights/eligibility*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            eligible: true,
            days: 10,
            hasOneMonthData: true,
            joinedAt: "2026-04-01T00:00:00Z"
          }
        })
      });
    });

    // Mock Major Symptoms
    await page.route("**/api/insights/major-symptoms*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            topSymptoms: [{ name: "Memory Problems", count: 5, severity: "moderate", pillar: "cognitive", source: "patient" }],
            alerts: [{ type: "Trend", message: "Frequent dizzy spells reported", date: new Date().toISOString() }]
          }
        })
      });
    });

    // Mock Aggregate
    await page.route("**/api/insights/daily*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            physical: 30, mood: 45, cognitive: 60, sleep: 20, social: 10
          }
        })
      });
    });

    // Mock AI Summary
    await page.route("**/api/insights/ai-summary*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            summary: "AI thinks you are doing okay",
            status: "stable",
            topConcern: null,
            keyFindings: [],
            criticalRisks: []
          }
        })
      });
    });

    // Mock Predictive
    await page.route("**/api/insights/predictive*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            outlook: "No major shifts predicted",
            predictedTrend: "stable",
            watchList: [],
            proactiveSteps: ["Stay hydrated"]
          }
        })
      });
    });
  });


  test("Patient can see the symptom chart and interact with range presets", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Insights" }).click();
    await page.waitForURL("**/insights");

    await expect(page.getByText("Getting AI Insights")).not.toBeVisible({ timeout: 60000 });

    await expect(page.locator(".recharts-wrapper").first()).toBeVisible();

    const btn1m = page.getByRole("button", { name: "1 Month" });
    await expect(btn1m).toBeVisible({ timeout: 30000 });
    await btn1m.click();
    
    await expect(page.locator(".recharts-wrapper").first()).toBeVisible();
  });

  test("Patient can reveal AI clinical insights", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Insights" }).click();
    await page.waitForURL("**/insights");
    await expect(page.getByText("Getting AI Insights")).not.toBeVisible({ timeout: 60000 });

    const revealBtn = page.getByRole("button", { name: "See AI Insights" });
    await expect(revealBtn).toBeEnabled({ timeout: 30000 });
    await revealBtn.click();

    await expect(page.getByText("AI thinks you are doing okay")).toBeVisible({ timeout: 15000 });
  });

  test("Patient can reveal predictive analysis", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Insights" }).click();
    await page.waitForURL("**/insights");
    await expect(page.getByText("Getting AI Insights")).not.toBeVisible({ timeout: 60000 });

    const revealBtn = page.getByRole("button", { name: "See Predictive Analysis" });
    await expect(revealBtn).toBeEnabled({ timeout: 30000 });
    await revealBtn.click();

    await expect(page.getByText("No major shifts predicted")).toBeVisible({ timeout: 15000 });
  });

});
