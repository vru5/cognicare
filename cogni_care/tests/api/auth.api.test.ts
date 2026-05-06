/**
 * API Tests — Authentication Routes
 * Tests: POST /api/auth/login, GET /api/auth/profile
 *
 * Run: npx playwright test tests/api/auth.api.test.ts
 */

import { test, expect, request } from "@playwright/test";
import { BACKEND_URL, PATIENT_EMAIL, PATIENT_PASSWORD, CARER_EMAIL, CARER_PASSWORD } from "../helpers/constants";
import { apiLoginAsPatient, apiLoginAs } from "../helpers/auth.helpers";

test.describe("Auth API", () => {

  test("POST /login — patient credentials return PATIENT role and PAT- prefixed profileId", async () => {
    const api = await request.newContext();
    const body = await apiLoginAsPatient(api);

    expect(body.role).toBe("PATIENT");
    expect(body.profileId).toMatch(/^PAT-/);
    expect(body.userId).toBeTruthy();
    await api.dispose();
  });

  test("POST /login — wrong password returns 401", async () => {
    const api = await request.newContext();
    const res = await api.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: PATIENT_EMAIL, password: "wrongpassword123" },
    });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBeFalsy();
    await api.dispose();
  });

  test("POST /login — missing password returns 401", async () => {
    const api = await request.newContext();
    const res = await api.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: PATIENT_EMAIL },
    });

    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test("POST /login — missing email returns 401", async () => {
    const api = await request.newContext();
    const res = await api.post(`${BACKEND_URL}/api/auth/login`, {
      data: { password: PATIENT_PASSWORD },
    });

    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test("POST /login — carer seed account returns CARER role if it exists", async () => {
    const api = await request.newContext();
    const res = await api.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: CARER_EMAIL, password: CARER_PASSWORD },
    });
    // Accept 401 if carer seed doesn't exist, or 200 with correct shape if it does
    expect([200, 401]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      if (body.success) {
        expect(body.role).toBe("CARER");
        expect(body.profileId).toMatch(/^CAR-/);
      }
    }
    await api.dispose();
  });

  test("GET /profile — returns correct role and profileId for a known userId", async () => {
    const api = await request.newContext();
    const loginBody = await apiLoginAsPatient(api);

    const res = await api.get(`${BACKEND_URL}/api/auth/profile`, {
      params: { userId: loginBody.userId },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.role).toBe("PATIENT");
    await api.dispose();
  });

  test("GET /profile — missing userId returns 400", async () => {
    const api = await request.newContext();
    const res = await api.get(`${BACKEND_URL}/api/auth/profile`);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    await api.dispose();
  });

});
