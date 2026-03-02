// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Menu Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/menu.html', { waitUntil: 'domcontentloaded' });
  });

  // ─── Structure ───

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Menu.*WoW!!! Mo:Mo/i);
  });

  test('has H1 heading', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toContainText(/Craving/i);
  });

  // ─── Category Filter Tabs ───

  test('renders all category filter tabs', async ({ page }) => {
    const tabs = page.locator('.menu-tab');
    await expect(tabs).toHaveCount(6); // All, Steamed, Fried, Jhol, Sides, Drinks
  });

  test('"All Items" tab is active by default', async ({ page }) => {
    const allTab = page.locator('.menu-tab[data-category="all"]');
    await expect(allTab).toHaveClass(/active/);
    await expect(allTab).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking a category tab filters items', async ({ page }) => {
    // Click "Steamed" tab
    await page.click('.menu-tab[data-category="steamed"]');

    // Steamed section should be visible
    const steamedSection = page.locator('.menu-section[data-category="steamed"]');
    await expect(steamedSection).toBeVisible();

    // Fried section should be hidden
    const friedSection = page.locator('.menu-section[data-category="fried"]');
    await expect(friedSection).toBeHidden();

    // "Steamed" tab should be active
    const steamedTab = page.locator('.menu-tab[data-category="steamed"]');
    await expect(steamedTab).toHaveClass(/active/);
  });

  test('clicking "All Items" shows all sections', async ({ page }) => {
    // First filter to steamed
    await page.click('.menu-tab[data-category="steamed"]');
    // Then click "All"
    await page.click('.menu-tab[data-category="all"]');

    const sections = page.locator('.menu-section');
    const count = await sections.count();
    for (let i = 0; i < count; i++) {
      await expect(sections.nth(i)).toBeVisible();
    }
  });

  // ─── Menu Sections ───

  test('has all 5 menu sections', async ({ page }) => {
    const sections = page.locator('.menu-section');
    await expect(sections).toHaveCount(5); // Steamed, Fried, Jhol, Sides, Drinks
  });

  test('steamed section has at least 5 items', async ({ page }) => {
    const items = page.locator('.menu-section[data-category="steamed"] .menu-item');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  // ─── Menu Item Content ───

  test('each menu item has a name, description, and price', async ({ page }) => {
    // Check first 3 items
    const items = page.locator('.menu-section[data-category="steamed"] .menu-item');
    const count = Math.min(await items.count(), 3);

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      // Name
      const name = item.locator('h3');
      const nameText = await name.textContent();
      expect(nameText.length).toBeGreaterThan(2);

      // Description
      const desc = item.locator('p');
      const descText = await desc.first().textContent();
      expect(descText.length).toBeGreaterThan(10);

      // Price
      const price = item.locator('.text-saffron-light');
      const priceText = await price.first().textContent();
      expect(priceText).toMatch(/\$\d+\.\d{2}/);
    }
  });

  test('menu items have spice indicators', async ({ page }) => {
    const indicators = page.locator('.spice-indicator');
    const count = await indicators.count();
    expect(count).toBeGreaterThan(0);
  });

  test('some items have dietary badges', async ({ page }) => {
    const badges = page.locator('.dietary-badge');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  // ─── Spice Guide ───

  test('spice guide section exists', async ({ page }) => {
    const guide = page.locator('section[aria-label="Spice level guide"]');
    await expect(guide).toBeVisible();
    await expect(guide).toContainText('Mild');
    await expect(guide).toContainText('Medium');
    await expect(guide).toContainText('Hot');
  });

  // ─── No PDF menus ───

  test('no PDF links on menu page', async ({ page }) => {
    const pdfLinks = page.locator('a[href$=".pdf"]');
    await expect(pdfLinks).toHaveCount(0);
  });

  // ─── All images have alt text ───

  test('all images have alt text', async ({ page }) => {
    const images = page.locator('img:not([aria-hidden="true"])');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Image ${i} missing alt text`).toBeTruthy();
    }
  });

  // ─── Sticky tabs ───

  test('menu tabs container has sticky positioning', async ({ page }) => {
    const tabBar = page.locator('[role="tablist"]');
    await expect(tabBar).toHaveClass(/sticky/);
  });
});
