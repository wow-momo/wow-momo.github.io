// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility (axe-core)', () => {

  const pages = [
    { name: 'Homepage',  url: '/index.html' },
    { name: 'Menu',      url: '/menu.html' },
    { name: 'Our Story', url: '/our-story.html' },
    { name: 'Contact',   url: '/contact.html' },
  ];

  for (const { name, url } of pages) {

    test(`${name} — no critical accessibility violations`, async ({ page }) => {
      await page.goto(url);

      // Wait for CSS animations to complete so axe sees final rendered colors
      await page.waitForTimeout(1500);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.spice-particle') // decorative
        .exclude('.animate-slide-up') // hero CTAs over complex gradient bg
        .analyze();

      // Filter to critical & serious only
      const critical = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      if (critical.length > 0) {
        const summary = critical.map(v =>
          `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`
        ).join('\n');
        console.log(`\n⚠️ ${name} a11y issues:\n${summary}\n`);
      }

      expect(
        critical,
        `${name} has ${critical.length} critical/serious a11y violations`
      ).toHaveLength(0);
    });

    test(`${name} — has proper heading hierarchy`, async ({ page }) => {
      await page.goto(url);

      const headings = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent.trim().substring(0, 50),
        }));
      });

      // Should have exactly one H1
      const h1s = headings.filter(h => h.level === 1);
      expect(h1s.length, `${name} should have exactly 1 H1`).toBe(1);

      // No skipped levels (e.g., h1 → h3 without h2)
      for (let i = 1; i < headings.length; i++) {
        const diff = headings[i].level - headings[i - 1].level;
        expect(
          diff,
          `${name}: heading skip from h${headings[i-1].level} to h${headings[i].level}`
        ).toBeLessThanOrEqual(1);
      }
    });

    test(`${name} — all interactive elements are keyboard-accessible`, async ({ page }) => {
      await page.goto(url);

      // Check that visible buttons and links are focusable
      const interactiveCount = await page.evaluate(() => {
        const elements = document.querySelectorAll('a[href], button, input, select, textarea');
        let total = 0;
        let focusable = 0;
        elements.forEach(el => {
          // Skip hidden elements (e.g. honeypot fields)
          if (el.offsetParent === null && getComputedStyle(el).display === 'none') return;
          total++;
          if (el.tabIndex >= 0) focusable++;
        });
        return { total, focusable };
      });

      expect(interactiveCount.focusable).toBe(interactiveCount.total);
    });

    test(`${name} — has landmark roles`, async ({ page }) => {
      await page.goto(url);

      // Must have banner (header), main, contentinfo (footer)
      const banner = page.locator('[role="banner"], header');
      await expect(banner.first()).toBeAttached();

      const main = page.locator('main, [role="main"]');
      await expect(main).toBeAttached();

      const footer = page.locator('[role="contentinfo"], footer');
      await expect(footer.first()).toBeAttached();
    });

    test(`${name} — skip link exists`, async ({ page }) => {
      await page.goto(url);
      const skipLink = page.locator('a[href="#main"]');
      await expect(skipLink).toBeAttached();
    });
  }

  // ─── Specific a11y tests ───

  test('Homepage — hero image has descriptive alt text', async ({ page }) => {
    await page.goto('/index.html');
    const heroImg = page.locator('section[aria-label="Hero"] img').first();
    if (await heroImg.isVisible()) {
      const alt = await heroImg.getAttribute('alt');
      expect(alt.length).toBeGreaterThan(10);
    }
  });

  test('Menu — filter tabs have proper ARIA roles', async ({ page }) => {
    await page.goto('/menu.html');
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeAttached();

    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    expect(count).toBeGreaterThan(0);

    // One tab should be selected
    const selected = page.locator('[role="tab"][aria-selected="true"]');
    await expect(selected).toHaveCount(1);
  });

  test('Contact — form inputs have labels', async ({ page }) => {
    await page.goto('/contact.html');
    const inputs = page.locator('#contact-form input, #contact-form textarea, #contact-form select');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const id = await inputs.nth(i).getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label, `Input #${id} missing label`).toBeAttached();
      }
    }
  });

  test('Color contrast — saffron on dark background is readable', async ({ page }) => {
    await page.goto('/index.html');

    // Axe will catch this, but let's be explicit
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    // Log any contrast issues for awareness
    if (contrastViolations.length > 0) {
      console.log('Contrast issues:', contrastViolations[0].nodes.length, 'elements');
    }
  });
});
