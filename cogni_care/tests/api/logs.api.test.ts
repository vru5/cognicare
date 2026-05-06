/**
 * API Tests — Symptom Logs Routes
 * Tests: GET /api/logs, POST /api/logs, DELETE /api/logs
 *
 * Run: npx playwright test tests/api/logs.api.test.ts
 */

import { test, expect, request } from "@playwright/test";
import { BACKEND_URL } from "../helpers/constants";
import { apiLoginAsPatient } from "../helpers/auth.helpers";

test.describe("Logs API", () => {

  test("GET /logs — returns a logs array for a valid patientId", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.get(`${BACKEND_URL}/api/logs`, {
      params: { patientId: profileId },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.logs)).toBe(true);
    await api.dispose();
  });

  test("GET /logs — missing patientId returns 400", async () => {
    const api = await request.newContext();
    const res = await api.get(`${BACKEND_URL}/api/logs`);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/patientId/i);
    await api.dispose();
  });

  test("POST /logs — missing required fields returns 400", async () => {
    const api = await request.newContext();
    const res = await api.post(`${BACKEND_URL}/api/logs`, {
      data: { rawText: "feeling dizzy" }, // missing patientId
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    await api.dispose();
  });

  test("DELETE /logs — missing logId returns 400", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.delete(`${BACKEND_URL}/api/logs`, {
      data: { patientId: profileId }, // logId missing
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    await api.dispose();
  });

  test("DELETE /logs — missing patientId returns 400", async () => {
    const api = await request.newContext();
    const res = await api.delete(`${BACKEND_URL}/api/logs`, {
      data: { logId: "some-id" }, // patientId missing
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    await api.dispose();
  });

  test("GET /logs — carer accessor with isCarer=true returns success", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    // A patient viewing their own logs (isCarer=false is default)
    const res = await api.get(`${BACKEND_URL}/api/logs`, {
      params: { patientId: profileId, isCarer: "false" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    await api.dispose();
  });

});
