/**
 * API Tests — Settings Routes
 * Tests: GET /api/settings/profile, GET /api/settings/carers, PATCH /api/settings/carers
 *
 * Run: npx playwright test tests/api/settings.api.test.ts
 */

import { test, expect, request } from "@playwright/test";
import { BACKEND_URL } from "../helpers/constants";
import { apiLoginAsPatient } from "../helpers/auth.helpers";

test.describe("Settings API", () => {

  test("GET /profile — missing userId returns 400", async () => {
    const api = await request.newContext();
    const res = await api.get(`${BACKEND_URL}/api/settings/profile`);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    await api.dispose();
  });

  test("GET /carers — missing patientProfileId returns 400", async () => {
    const api = await request.newContext();
    const res = await api.get(`${BACKEND_URL}/api/settings/carers`);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    await api.dispose();
  });

  test("GET /carers — valid patientProfileId returns carers array", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.get(`${BACKEND_URL}/api/settings/carers`, {
      params: { patientProfileId: profileId },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.carers)).toBe(true);
    await api.dispose();
  });

  test("PATCH /carers — missing carerProfileId returns 400", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.patch(`${BACKEND_URL}/api/settings/carers`, {
      data: {
        patientProfileId: profileId,
        // carerProfileId intentionally missing
        data: { accessSymptomLogs: true },
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    await api.dispose();
  });

  test("PATCH /carers — missing data payload returns 400", async () => {
    const api = await request.newContext();
    const { profileId } = await apiLoginAsPatient(api);

    const res = await api.patch(`${BACKEND_URL}/api/settings/carers`, {
      data: {
        patientProfileId: profileId,
        carerProfileId: "CAR-000000",
        // data payload intentionally missing
      },
    });
    expect(res.status()).toBe(400);
    await api.dispose();
  });

});
