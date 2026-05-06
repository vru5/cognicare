/**
 * E2E Tests — Settings
 * Tests: view settings, toggle carer access permissions, save
 *
 * Run: npx playwright test tests/e2e/settings.e2e.test.ts
 */

import { test, expect } from "@playwright/test";
import { e2eLoginAsPatient } from "../helpers/auth.helpers";

test.setTimeout(60000);

test.describe("Settings (E2E)", () => {

  test("Patient can navigate to Settings", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Settings" }).click();
    await page.waitForURL("**/settings");
    expect(page.url()).toContain("/settings");
  });

  test("Patient can access Carer Access Control page", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Settings" }).click();
    await page.getByRole("link", { name: "Manage Carer Access Control" }).click();
    expect(page.url()).toContain("settings");
  });

  test("Patient can toggle a carer permission and save without errors", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Settings" }).click();
    await page.getByRole("link", { name: "Manage Carer Access Control" }).click();

    // Select first carer in the list
    await page.locator(".p-2").first().click();
    await page.locator("div").filter({ hasText: "Symptom RecordsAllow viewing" }).nth(2).click();

    // Toggle a permission switch
    await page.getByRole("switch").first().click();

    // Save
    await page.getByRole("button", { name: "Save Permissions" }).click();

    // No error after saving
    await page.waitForTimeout(1500);
    const errorVisible = await page.getByText(/error|failed/i).isVisible();
    expect(errorVisible).toBe(false);
  });

});
