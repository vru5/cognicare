import { Page } from "@playwright/test";

/**
 * Navigates to a specific date in the calendar.
 * Assumes the calendar is open or first button opens it.
 */
export async function navigateCalendarToApril13(page: Page) {
  // Open calendar (first button in MobilePageLayout or similar)
  // In Logs page, it's the date range display button
  const calendarTrigger = page.getByRole("button").first();
  await calendarTrigger.click();

  // We are in May 2026. April 13th is previous month.
  // Click the left arrow in the calendar header
  const prevMonth = page.locator('button:has([class*="ChevronLeft"]), button:has(.lucide-chevron-left)').first();
  if (await prevMonth.isVisible()) {
    await prevMonth.click();
  } else {
    // Fallback: try clicking the first button in the calendar modal which is usually the left arrow
    await page.locator('.lucide-chevron-left').first().click();
  }

  // Click the 13th
  await page.getByRole("button", { name: "13", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
}

export async function goToLogs(page: Page) {
  await page.getByRole("link", { name: "Logs" }).click();
  await page.waitForURL("**/brain-dump");
  await page.waitForLoadState("networkidle");
}

