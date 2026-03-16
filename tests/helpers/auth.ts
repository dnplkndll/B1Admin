import type { Page } from "@playwright/test";

const HEADER_FIX_CSS = `
  #site-header, #site-toolbar {
    pointer-events: none !important;
  }
  #site-header a, #site-header button, #site-header input,
  #site-header [role="tab"], #site-header [role="combobox"],
  #site-header span, #site-header img, #site-header div[id="secondaryMenu"],
  #site-header div[id="secondaryMenu"] * {
    pointer-events: auto !important;
  }
`;

/**
 * Prevent the sticky/fixed site header from intercepting clicks on content
 * below it. Makes the header overlay transparent to pointer events while
 * keeping interactive elements (buttons, links) inside it clickable.
 *
 * Uses addInitScript to inject CSS on every page load (including in-test
 * navigations like clicking links), so it only needs to be called once
 * per test in beforeEach.
 */
export async function scrollPastHeader(page: Page) {
  // addInitScript runs on every new document (navigation), before page scripts.
  // We inject a <style> tag as soon as the document is available.
  await page.addInitScript((css: string) => {
    const inject = () => {
      if (document.getElementById("pw-header-fix")) return;
      const style = document.createElement("style");
      style.id = "pw-header-fix";
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    };
    // Try immediately (for document_start), and also on DOMContentLoaded
    if (document.head || document.documentElement) inject();
    else document.addEventListener("DOMContentLoaded", inject);
  }, HEADER_FIX_CSS);

  // Also inject on the current page right now
  await page.addStyleTag({ content: HEADER_FIX_CSS });
}

export async function login(page: Page) {
  await page.goto("/");

  const emailInput = page.locator('input[type="email"]');

  // With storageState, the app goes straight to dashboard — emailInput never appears.
  // Use a short 5s timeout: if emailInput doesn't show within 5s, we're authenticated.
  // On unauthenticated pages, the login form renders quickly and we catch it in time.
  const needsLogin = await emailInput
    .waitFor({ state: "visible", timeout: 5000 })
    .then(() => true)
    .catch(() => false);

  if (!needsLogin) {
    // Already authenticated. Wait up to 30s for nav to be ready (cold-start CI can be slow).
    await page.locator("#primaryNavButton").waitFor({ state: "visible", timeout: 30000 });
    return;
  }

  // Full login flow
  await emailInput.fill("demo@b1.church");
  await page.fill('input[type="password"]', "password");
  await page.click('button[type="submit"]');

  // After submit, the login form stays mounted while the church selection dialog is shown.
  // SelectChurchModal always appears on a fresh session (no lastChurchId cookie).
  // Wait for either: church selection dialog OR navigation away from /login.
  const churchDialog = page.locator('[role="dialog"]').filter({ hasText: "Select a Church" });
  await Promise.race([
    churchDialog.waitFor({ state: "visible", timeout: 15000 }).catch(() => {}),
    page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 }).catch(() => {}),
  ]);

  // Handle church selection dialog if present
  const dialogVisible = await churchDialog.isVisible().catch(() => false);
  if (dialogVisible) {
    const graceChurch = page
      .locator('[role="dialog"] h3:has-text("Grace Community Church")')
      .first()
      .or(page.locator('[role="dialog"] h3:has-text("Gracious Community Church")').first());
    await graceChurch.click({ timeout: 10000 });
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
  }

  // After login, wait for nav to be ready before returning
  await page.locator("#primaryNavButton").waitFor({ state: "visible", timeout: 30000 });
}
