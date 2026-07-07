import { expect, type Page } from "@playwright/test";

// Form-fill helpers; callers handle form opening and post-save assertions.
export type FillFundFormInput = {
  name: string;
  // Toggle taxDeductible after fill; demo pattern: create as Non-Deductible, edit back to Deductible.
  toggleTaxDeductible?: boolean;
};

export async function fillFundForm(page: Page, input: FillFundFormInput) {
  const fundName = page.locator('[name="fundName"]');
  await expect(fundName).toBeVisible({ timeout: 10000 });
  await fundName.fill(input.name);
  if (input.toggleTaxDeductible) {
    // Avoid "element detached" race as FundEdit re-renders mid-click.
    await page.locator('[name="taxDeductible"]').click({ force: true });
  }
  // Wait for POST to settle before caller asserts on row counts (prevents duplicate-fund retries).
  const fundPost = page.waitForResponse(
    r => r.url().includes("/giving/funds") && r.request().method() === "POST",
    { timeout: 15000 }
  );
  await page.locator("button").getByText("Save").click({ force: true });
  await fundPost;
}
