// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Mobile Experience', () => {

  // These tests specifically target mobile viewports
  test.use({
    viewport: { width: 375, height: 812 }, // iPhone-sized
  });

  // ─── HOMEPAGE MOBILE ───

  test.describe('Homepage - Mobile', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/index.html');
    });

    test('sticky "Order Now" button is visible at bottom', async ({ page }) => {
      const orderBar = page.locator('#mobile-order-bar a, .fixed.bottom-0 a[href="#order"]').first();
      await expect(orderBar).toBeVisible();
      await expect(orderBar).toContainText('Order Now');
    });

    test('hamburger menu button is visible on mobile', async ({ page }) => {
      const hamburger = page.locator('#mobile-menu-btn');
      await expect(hamburger).toBeVisible();
    });

    test('desktop nav links are hidden on mobile', async ({ page }) => {
      const desktopNav = page.locator('ul[role="menubar"]');
      await expect(desktopNav).toBeHidden();
    });

    test('mobile menu opens and closes', async ({ page }) => {
      const hamburger = page.locator('#mobile-menu-btn');
      const mobileMenu = page.locator('#mobile-menu');

      // Initially hidden
      await expect(mobileMenu).toBeHidden();

      // Click to open
      await hamburger.click();
      await expect(mobileMenu).toBeVisible();
      await expect(hamburger).toHaveAttribute('aria-expanded', 'true');

      // Has all nav links
      const links = mobileMenu.locator('a');
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(4);

      // Click to close
      await hamburger.click();
      await expect(mobileMenu).toBeHidden();
    });

    test('mobile menu closes on link click', async ({ page }) => {
      const hamburger = page.locator('#mobile-menu-btn');
      const mobileMenu = page.locator('#mobile-menu');

      await hamburger.click();
      await expect(mobileMenu).toBeVisible();

      // Click a link inside the menu
      await mobileMenu.locator('a').first().click();
      await expect(mobileMenu).toBeHidden();
    });

    test('hero content is readable on mobile', async ({ page }) => {
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      const box = await h1.boundingBox();
      // H1 should be within viewport width
      expect(box.width).toBeLessThanOrEqual(375);
    });

    test('CTA buttons are tappable size (min 44x44)', async ({ page }) => {
      const ctas = page.locator('section[aria-label="Hero"] a');
      const count = await ctas.count();
      for (let i = 0; i < count; i++) {
        const box = await ctas.nth(i).boundingBox();
        if (box) {
          expect(box.height, `CTA ${i} height too small`).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('no horizontal scroll on mobile', async ({ page }) => {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
    });
  });

  // ─── MENU MOBILE ───

  test.describe('Menu - Mobile', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/menu.html');
    });

    test('category tabs are horizontally scrollable', async ({ page }) => {
      const tabContainer = page.locator('#menu-tabs');
      await expect(tabContainer).toBeVisible();

      // Container should have overflow handling
      const overflow = await tabContainer.evaluate(el =>
        window.getComputedStyle(el).overflowX
      );
      expect(overflow).toBe('auto');
    });

    test('menu items stack in single column on mobile', async ({ page }) => {
      const items = page.locator('.menu-section[data-category="steamed"] .menu-item');
      const count = await items.count();
      if (count >= 2) {
        const box1 = await items.nth(0).boundingBox();
        const box2 = await items.nth(1).boundingBox();
        // Items should be stacked (second below first)
        expect(box2.y).toBeGreaterThan(box1.y + box1.height - 10);
      }
    });

    test('sticky "Order Now" button visible on menu page', async ({ page }) => {
      const orderBtn = page.locator('.fixed.bottom-0 a[href="#order"]').first();
      await expect(orderBtn).toBeVisible();
    });

    test('no horizontal overflow on menu page', async ({ page }) => {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  });

  // ─── CONTACT MOBILE ───

  test.describe('Contact - Mobile', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/contact.html');
    });

    test('contact form is usable on mobile', async ({ page }) => {
      const form = page.locator('#contact-form');
      await expect(form).toBeVisible();

      // All inputs should be full-width
      const inputs = form.locator('input, textarea, select');
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const box = await inputs.nth(i).boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(300); // Should nearly fill viewport
        }
      }
    });

    test('phone number is clickable (tel: link)', async ({ page }) => {
      const phoneLink = page.locator('a[href^="tel:"]').first();
      await expect(phoneLink).toBeVisible();
    });
  });

  // ─── KEYBOARD / TOUCH NAVIGATION ───

  test.describe('Touch & interaction', () => {

    test('escape key closes mobile menu', async ({ page }) => {
      await page.goto('/index.html');
      const hamburger = page.locator('#mobile-menu-btn');
      const mobileMenu = page.locator('#mobile-menu');

      await hamburger.click();
      await expect(mobileMenu).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(mobileMenu).toBeHidden();
    });
  });
});
