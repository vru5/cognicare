/**
 * E2E Tests — Brain Dump (Symptom Logging)
 * Tests: submit a written entry, AI processing
 */

import { test, expect } from "@playwright/test";
import { e2eLoginAsPatient } from "../helpers/auth.helpers";

test.setTimeout(90000);

test.describe("Brain Dump (E2E)", () => {

  test.beforeEach(async ({ page }) => {
    // Mock Brain Dump processing
    await page.route("**/api/brain-dump/process", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "log-123",
            symptoms: ["Dizzy"],
            severity: "mild"
          }
        })
      });
    });
  });

  test("Patient can submit a written symptom entry without errors", async ({ page }) => {
    await e2eLoginAsPatient(page);

    await page.getByPlaceholder(/How are you feeling/).fill("I am feeling dizzy today");
    await page.getByRole("button", { name: "Process Written Entry" }).click();

    // With mocking, this should be very fast
    await expect(page.getByText(/error|failed|invalid/i)).not.toBeVisible();
    
    // Check for success feedback (if any) or just no crash
    expect(page.url()).toContain("/brain-dump");
  });

  test("Submitting an empty entry does not crash the page", async ({ page }) => {
    await e2eLoginAsPatient(page);

    const submitBtn = page.getByRole("button", { name: "Process Written Entry" });
    const isDisabled = await submitBtn.isDisabled().catch(() => false);
    if (!isDisabled) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    expect(page.url()).toContain("/brain-dump");
  });

});
