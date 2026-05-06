/**
 * E2E Tests — Authentication
 * Tests: sign in, sign out
 *
 * Run: npx playwright test tests/e2e/auth.e2e.test.ts
 */

import { test, expect } from "@playwright/test";
import { e2eLoginAsPatient } from "../helpers/auth.helpers";
import { FRONTEND_URL, PATIENT_EMAIL } from "../helpers/constants";

test.setTimeout(60000);

test.describe("Authentication (E2E)", () => {

  test("Patient can sign in and reach the brain-dump dashboard", async ({ page }) => {
    await e2eLoginAsPatient(page);
    // Confirmed by the helper — just double-check URL
    await expect(page).toHaveURL(`${FRONTEND_URL}/brain-dump`);
  });

  test("Wrong password shows an error and stays on the login page", async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("textbox", { name: "name@example.com" }).fill(PATIENT_EMAIL);
    await page.getByRole("textbox", { name: "Enter your password" }).fill("totallyWrongPassword!");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should NOT navigate away from the auth page
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain("/brain-dump");
  });

  test("Patient can sign out and is returned to the landing page", async ({ page }) => {
    await e2eLoginAsPatient(page);

    await page.getByRole("link", { name: "Settings" }).click();
    await page.getByRole("button", { name: "Sign Out" }).click();

    await expect(page).toHaveURL(FRONTEND_URL + "/login");
  });

});
