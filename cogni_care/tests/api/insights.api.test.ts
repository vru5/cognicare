/**
 * API Tests — Insights Routes
 * Tests: GET /api/insights/eligibility, /daily, /major-symptoms, /ai-summary
 *
 * Run: npx playwright test tests/api/insights.api.test.ts
 */

import { test, expect, request } from "@playwright/test";
import { BACKEND_URL } from "../helpers/constants";
import { apiLoginAsPatient } from "../helpers/auth.helpers";

test.describe("Insights API", () => {

  test("GET /eligibility — missing patientId returns 400", async () => {
    const api = await request.newContext();
    const res = await api.get(`${BACKEND_URL}/api/insights/eligibility`);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    await api.dispose();
  });

  test("GET /eligibility — valid patientId returns correct eligibility shape", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.get(`${BACKEND_URL}/api/insights/eligibility`, {
      params: { patientId: profileId },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.eligible).toBe("boolean");
    expect(typeof body.data.hasOneMonthData).toBe("boolean");
    expect(typeof body.data.days).toBe("number");
    expect(body.data.joinedAt).toBeTruthy();
    await api.dispose();
  });

  test("GET /major-symptoms — returns topSymptoms and alerts arrays", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.get(`${BACKEND_URL}/api/insights/major-symptoms`, {
      params: { patientId: profileId },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.topSymptoms)).toBe(true);
    expect(Array.isArray(body.data.alerts)).toBe(true);
    await api.dispose();
  });

  test("GET /major-symptoms — missing patientId returns 400", async () => {
    const api = await request.newContext();
    const res = await api.get(`${BACKEND_URL}/api/insights/major-symptoms`);
    expect(res.status()).toBe(400);
    await api.dispose();
  });

  test("GET /daily — missing date param returns 400", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.get(`${BACKEND_URL}/api/insights/daily`, {
      params: { patientId: profileId }, // date missing
    });
    expect(res.status()).toBe(400);
    await api.dispose();
  });

  test("GET /daily — valid params return a numeric score object or null", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.get(`${BACKEND_URL}/api/insights/daily`, {
      params: { patientId: profileId, date: "2025-01-01", endDate: "2025-01-07" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    // data is either null (no logs) or an object with numeric pillar scores
    if (body.data !== null) {
      expect(typeof body.data.physical).toBe("number");
      expect(typeof body.data.mood).toBe("number");
    }
    await api.dispose();
  });

  test("GET /ai-summary — missing date params returns 400", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.get(`${BACKEND_URL}/api/insights/ai-summary`, {
      params: { patientId: profileId }, // date + endDate missing
    });
    expect(res.status()).toBe(400);
    await api.dispose();
  });

});
