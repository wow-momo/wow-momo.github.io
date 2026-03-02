// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('HTML5 Validation & SEO', () => {

  const pages = [
    { name: 'Homepage',  url: '/index.html' },
    { name: 'Menu',      url: '/menu.html' },
    { name: 'Our Story', url: '/our-story.html' },
    { name: 'Contact',   url: '/contact.html' },
  ];

  for (const { name, url } of pages) {

    test(`${name} — has valid HTML5 doctype`, async ({ page }) => {
      await page.goto(url);
      const doctype = await page.evaluate(() => {
        const dt = document.doctype;
        return dt ? dt.name : null;
      });
      expect(doctype).toBe('html');
    });

    test(`${name} — has charset meta tag`, async ({ page }) => {
      await page.goto(url);
      const charset = page.locator('meta[charset]');
      await expect(charset).toHaveAttribute('charset', /utf-8/i);
    });

    test(`${name} — has viewport meta tag`, async ({ page }) => {
      await page.goto(url);
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute('content', /width=device-width/);
    });

    test(`${name} — no broken internal links`, async ({ page }) => {
      await page.goto(url);
      const links = page.locator('a[href]');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute('href');
        // Only check internal links (not #, tel:, mailto:, external)
        if (href && !href.startsWith('#') && !href.startsWith('tel:') &&
            !href.startsWith('mailto:') && !href.startsWith('http') &&
            href.endsWith('.html')) {
          const response = await page.request.get(href);
          expect(
            response.status(),
            `${name}: broken link to ${href}`
          ).toBeLessThan(400);
        }
      }
    });

    test(`${name} — has Open Graph or description meta`, async ({ page }) => {
      await page.goto(url);
      const desc = page.locator('meta[name="description"]');
      const hasDesc = await desc.count() > 0;
      expect(hasDesc, `${name} missing meta description`).toBeTruthy();
    });

    test(`${name} — external links have rel="noopener"`, async ({ page }) => {
      await page.goto(url);
      const externalLinks = page.locator('a[target="_blank"]');
      const count = await externalLinks.count();

      for (let i = 0; i < count; i++) {
        const rel = await externalLinks.nth(i).getAttribute('rel');
        expect(
          rel,
          `External link ${i} missing rel="noopener"`
        ).toContain('noopener');
      }
    });

    test(`${name} — no console errors`, async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(url);
      await page.waitForTimeout(1000);

      // Filter out expected errors (like missing images)
      const realErrors = errors.filter(e =>
        !e.includes('Failed to load resource') && // Missing placeholder images
        !e.includes('favicon')
      );

      expect(realErrors, `${name} has console errors: ${realErrors.join(', ')}`).toHaveLength(0);
    });
  }
});

test.describe('Cross-page Navigation', () => {

  test('can navigate from homepage to all pages', async ({ page }) => {
    await page.goto('/index.html');

    // → Menu
    await page.click('a[href="menu.html"]');
    await expect(page).toHaveURL(/menu(\.html)?$/);

    // → Our Story (via nav)
    await page.click('a[href="our-story.html"]');
    await expect(page).toHaveURL(/our-story(\.html)?$/);

    // → Contact
    await page.click('a[href="contact.html"]');
    await expect(page).toHaveURL(/contact(\.html)?$/);

    // → Back to Home
    await page.click('a[href="index.html"]');
    await expect(page).toHaveURL(/\/(index(\.html)?)?$/);
  });
});
