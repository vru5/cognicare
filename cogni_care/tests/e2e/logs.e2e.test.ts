/**
 * E2E Tests — Logs Page
 * Tests: view logs, week/month filtering, log entries visible
 *
 * Run: npx playwright test tests/e2e/logs.e2e.test.ts
 */

import { test, expect } from "@playwright/test";
import { e2eLoginAsPatient } from "../helpers/auth.helpers";
import { navigateCalendarToApril13 } from "../helpers/navigation.helpers";

test.setTimeout(120000);

test.describe("Logs (E2E)", () => {

  test("Patient can navigate to the logs page", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Logs" }).click();
    await page.waitForURL("**/logs");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/logs");
  });

  test("Patient can toggle week and month filter views", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Logs" }).click();
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "week" }).click();
    await page.getByRole("button", { name: "month" }).click();

    // No crash after toggling filters
    expect(page.url()).toContain("/logs");
  });

  test("Seed carer logs appear on the logs page", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Logs" }).click();
    await page.waitForURL("**/logs");
    await page.waitForLoadState("networkidle");

    // Navigate to April 13th for seed data
    await page.getByRole("button", { name: "month" }).click();
    await page.getByRole("button").filter({ has: page.locator(".lucide-chevron-left") }).first().click();
    await page.getByRole("button", { name: "13", exact: true }).first().click();

    // At least one carer-submitted log must be visible from seed data
    await page.locator("text=ADDED BY CARER 2").first().waitFor({ state: "visible", timeout: 20000 });
    const logCount = await page.locator("text=ADDED BY CARER 2").count();
    expect(logCount).toBeGreaterThan(0);
  });

  test("Patient can navigate to a specific date using the calendar picker", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Logs" }).click();
    await page.waitForURL("**/logs");
    await page.waitForLoadState("networkidle");
 
    // Navigate to April 13th
    await page.getByRole("button", { name: "month" }).click();
    await page.getByRole("button").filter({ has: page.locator(".lucide-chevron-left") }).first().click();
    await page.getByRole("button", { name: "13", exact: true }).first().click();

    // Page should still be functional
    expect(page.url()).toContain("/logs");
  });

});
