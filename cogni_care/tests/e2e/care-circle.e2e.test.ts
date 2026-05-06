/**
 * E2E Tests — Care Circle
 * Tests: open discuss thread, send message, resolve thread, direct chat
 */

import { test, expect } from "@playwright/test";
import { e2eLoginAsPatient } from "../helpers/auth.helpers";
import { goToLogs } from "../helpers/navigation.helpers";

test.setTimeout(90000);

test.describe("Care Circle (E2E)", () => {

  test.beforeEach(async ({ page }) => {
    // Mock Logs for the "Discuss" test
    await page.route("**/api/logs*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          logs: [
            {
              id: "log-123",
              patientId: "pat-1",
              createdAt: new Date().toISOString(),
              type: "patient",
              cognitive: "Memory Problems",
              cognitiveSeverity: 3,
              rawText: "I feel dizzy",
              threadId: null,
              notes: [
                {
                  id: "note-123",
                  carerId: "carer-1",
                  carerName: "Dr. Mock Carer",
                  text: "Please keep an eye on this",
                  createdAt: new Date().toISOString(),
                  accessCareCircle: true
                }
              ]
            }
          ]
        })
      });
    });

    // Mock Thread Creation from Note
    await page.route("**/api/chat/threads/from-note*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          thread: {
            id: "thread-123",
            title: "Mock Thread Title"
          }
        })
      });
    });

    // Mock Threads
    await page.route("**/api/chat/threads?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          threads: [
            { 
              id: "thread-123", 
              title: "Active Memory Thread", 
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isResolved: false,
              patientId: "pat-1",
              authorCarerId: "carer-1",
              unreadCount: 1 
            }
          ]
        })
      });
    });

    // Mock Contacts
    await page.route("**/api/chat/contacts?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          carers: [
            { id: "carer-123", name: "Dr. Mock Carer", role: "doctor", unreadCount: 0 }
          ],
          patients: []
        })
      });
    });

    // Mock Resolution
    await page.route("**/api/chat/threads/*/resolve", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true })
      });
    });
    
    // Mock Direct Chat Creation
    await page.route("**/api/chat/direct*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          chat: { 
            id: "chat-456", 
            title: "Dr. Mock Carer",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      });
    });

    // Mock Messages
    await page.route("**/api/chat/messages*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          messages: []
        })
      });
    });
  });

  test("Patient can open a Discuss thread and send a message", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Logs" }).click();
    await page.waitForURL("**/logs");
    await page.waitForLoadState("networkidle");

    const discussBtn = page.locator('button:has-text("Discuss")').first();
    await expect(discussBtn).toBeVisible({ timeout: 20000 });
    await discussBtn.click();

    await expect(page.getByPlaceholder(/Share your message/)).toBeVisible();
    await page.getByPlaceholder(/Share your message/).fill("E2E test message");
  });

  test("Patient can resolve an active care thread", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Care Circle" }).click();
    await page.waitForURL("**/care-circle");

    const thread = page.getByText("Active Memory Thread");
    await expect(thread).toBeVisible({ timeout: 15000 });

    const resolveBtn = page.getByRole("button", { name: "Resolve" }).first();
    
    page.once("dialog", d => d.accept());
    await resolveBtn.click();

    await expect(thread).not.toBeVisible({ timeout: 10000 });
  });

  test("Patient can start a direct chat with an authorized professional", async ({ page }) => {
    await e2eLoginAsPatient(page);
    await page.getByRole("link", { name: "Care Circle" }).click();
    await page.waitForURL("**/care-circle");

    await page.getByRole("button", { name: "Contacts" }).click();

    await expect(page.getByText("Dr. Mock Carer")).toBeVisible();
    await page.getByRole("button", { name: "Start Chatting" }).click();

    await expect(page.getByPlaceholder(/Share your message/)).toBeVisible();
  });

});
