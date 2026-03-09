import { test, expect } from '@playwright/test';

if(!process.env.BASE_URL) {
  // When not running on Github Actions, use localhost
  process.env.BASE_URL = "http://localhost:4321"
}

if(!process.env.BASE_URL.includes('about')) {
    process.env.BASE_URL += "/about"
}

test('has title', async ({ page }) => {
  await page.goto(process.env.BASE_URL);
  await expect(page).not.toHaveTitle(/Astro/);
});

test('has h1', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  await expect(page.getByRole('heading', { name: 'Astro', level: 1 })).not.toBeVisible();
  const h1 = page.locator('h1');
  await expect(h1).not.toBeEmpty();
});

test('has nav', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  const nav = page.locator('nav');
  await expect(nav).not.toBeEmpty();
});

test('has and follows links', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  await page.getByRole('link', { name: /about/i}).click();
  await page.getByRole('link', { name: /projects/i}).click();
  await page.getByRole('link', { name: /resume/i}).click();
  await page.getByRole('link', { name: /cat/i}).click();
});

test('has footer', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
});

test('has at least one section', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  const section = page.locator('section');
  await expect(section).toBeVisible();
});

test('has at least one paragraph', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  const para = page.locator('p').first();
  await expect(para).toBeVisible();
});

test('has a main element', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  const main = page.locator('main');
  await expect(main).not.toBeEmpty();
});

test('has an img element', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  const img = page.getByRole('img').first();
  await expect(img).not.toBeNull();
});

test('img element has src attribute', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  const img = page.locator('img').first();
  await expect(img).toHaveAttribute('src');
});

test('img element has alt attribute', async ({page}) => {
  await page.goto(process.env.BASE_URL);
  const img = page.locator('img').first();
  await expect(img).toHaveAttribute('alt');
});
