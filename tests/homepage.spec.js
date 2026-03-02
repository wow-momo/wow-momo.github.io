// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  // ─── Structure & Content ───

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/WoW Mo:Mo/i);
  });

  test('has meta description', async ({ page }) => {
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /momo/i);
  });

  test('has proper HTML5 lang attribute', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('has skip-to-main-content link', async ({ page }) => {
    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeAttached();
  });

  // ─── Navigation ───

  test('renders navigation with all links', async ({ page }) => {
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();

    const links = nav.locator('ul[role="menubar"] a');
    await expect(links).toHaveCount(4);
  });

  test('logo links to homepage', async ({ page }) => {
    const logo = page.locator('a[aria-label="WoW Mo:Mo Home"]').first();
    await expect(logo).toHaveAttribute('href', 'index.html');
  });

  test('has "Order Now" CTA button in header', async ({ page }) => {
    const orderBtn = page.locator('header a[href="#order"]').first();
    await expect(orderBtn).toBeAttached();
    await expect(orderBtn).toContainText('Order Now');
  });

  // ─── Hero Section ───

  test('hero section is visible with heading', async ({ page }) => {
    const hero = page.locator('section[aria-label="Hero"]');
    await expect(hero).toBeVisible();

    const h1 = page.locator('h1');
    await expect(h1).toContainText(/Craving/i);
  });

  test('hero has CTA buttons', async ({ page }) => {
    const orderCTA = page.locator('section[aria-label="Hero"] a[href="#order"]');
    await expect(orderCTA).toBeVisible();

    const menuCTA = page.locator('section[aria-label="Hero"] a[href="menu.html"]');
    await expect(menuCTA).toBeVisible();
  });

  // ─── What Is a Momo Section ───

  test('what-is-a-momo section exists', async ({ page }) => {
    const heading = page.locator('#what-is-momo');
    await expect(heading).toContainText(/Mo:Mo/i);
  });

  // ─── Popular Items Section ───

  test('popular items section shows 3 items', async ({ page }) => {
    const section = page.locator('section[aria-labelledby="popular-items"]');
    await expect(section).toBeVisible();

    const items = section.locator('article');
    await expect(items).toHaveCount(3);
  });

  test('popular items have prices', async ({ page }) => {
    const prices = page.locator('section[aria-labelledby="popular-items"] .text-saffron-light.text-xl');
    const count = await prices.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      const text = await prices.nth(i).textContent();
      expect(text).toMatch(/\$\d+\.\d{2}/);
    }
  });

  test('"View Full Menu" link goes to menu page', async ({ page }) => {
    const link = page.locator('a[href="menu.html"]').last();
    await expect(link).toBeVisible();
  });

  // ─── Footer ───

  test('footer has hours, contact, and links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Hours');
    await expect(footer).toContainText('Contact');
    await expect(footer).toContainText('Manor, TX');
  });

  test('footer has social media links', async ({ page }) => {
    const socials = page.locator('footer a[aria-label]');
    const count = await socials.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  // ─── Images ───

  test('all images have alt text', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Image ${i} missing alt text`).toBeTruthy();
      expect(alt.length).toBeGreaterThan(5);
    }
  });

  // ─── Performance ───

  test('page loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });
});
