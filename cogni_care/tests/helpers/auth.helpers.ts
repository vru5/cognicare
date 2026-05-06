/**
 * Shared authentication helpers used by both API and E2E tests.
 */

import { APIRequestContext, Page, expect } from "@playwright/test";
import { BACKEND_URL, FRONTEND_URL, PATIENT_EMAIL, PATIENT_PASSWORD } from "./constants";

// ─── API helper ──────────────────────────────────────────────────────────────

/**
 * Logs in via the backend REST API and returns the session body.
 * Used in API tests to get a real profileId / userId for follow-up requests.
 */
export async function apiLoginAs(
  api: APIRequestContext,
  email: string,
  password: string
) {
  const res = await api.post(`${BACKEND_URL}/api/auth/login`, {
    data: { email, password },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  return body as { userId: string; profileId: string; role: string; name: string };
}

/**
 * Convenience wrapper — logs in as the default patient seed account.
 */
export async function apiLoginAsPatient(api: APIRequestContext) {
  return apiLoginAs(api, PATIENT_EMAIL, PATIENT_PASSWORD);
}

// ─── E2E helper ──────────────────────────────────────────────────────────────

/**
 * Navigates to the app, signs in as the patient seed account,
 * and waits until the dashboard URL is reached.
 */
export async function e2eLoginAsPatient(page: Page) {
  await page.goto(FRONTEND_URL);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByRole("textbox", { name: "name@example.com" }).fill(PATIENT_EMAIL);
  await page.getByRole("textbox", { name: "Enter your password" }).fill(PATIENT_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(`${FRONTEND_URL}/brain-dump`);
  await expect(page).toHaveURL(`${FRONTEND_URL}/brain-dump`);
}
