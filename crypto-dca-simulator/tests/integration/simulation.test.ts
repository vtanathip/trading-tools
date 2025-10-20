/**
 * End-to-end simulation test
 * Tests complete user flow with Playwright
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('DCA Simulation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should display app header and form', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Crypto DCA Simulator');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should run complete simulation flow', async ({ page }) => {
    // Fill form
    await page.selectOption('select[name="assetPair"]', 'BTC-USD');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="investmentAmount"]', '100');
    await page.selectOption('select[name="frequency"]', 'weekly');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for results
    await expect(page.locator('.results-container')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.chart-container')).toBeVisible();

    // Verify metrics are displayed
    await expect(page.locator('text=Total Invested')).toBeVisible();
    await expect(page.locator('text=Current Value')).toBeVisible();
    await expect(page.locator('text=Profit/Loss')).toBeVisible();

    // Verify chart is rendered
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('.form-error')).toBeVisible();
  });

  test('should show error for future date', async ({ page }) => {
    await page.selectOption('select[name="assetPair"]', 'ETH-USD');
    await page.fill('input[name="startDate"]', '2099-01-01');
    await page.fill('input[name="investmentAmount"]', '50');
    await page.selectOption('select[name="frequency"]', 'daily');

    await page.click('button[type="submit"]');

    await expect(page.locator('.form-error')).toContainText(/date cannot be in the future/i);
  });

  test('should allow running another simulation', async ({ page }) => {
    // Run first simulation
    await page.selectOption('select[name="assetPair"]', 'BTC-USD');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="investmentAmount"]', '100');
    await page.selectOption('select[name="frequency"]', 'monthly');
    await page.click('button[type="submit"]');

    // Wait for results
    await expect(page.locator('.results-container')).toBeVisible({ timeout: 30000 });

    // Click reset button
    await page.click('button:has-text("Run Another Simulation")');

    // Form should be visible again
    await expect(page.locator('form')).toBeVisible();
    
    // Results should be hidden
    await expect(page.locator('.results-container')).not.toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/v3/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.selectOption('select[name="assetPair"]', 'BTC-USD');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="investmentAmount"]', '100');
    await page.selectOption('select[name="frequency"]', 'weekly');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.app-error')).toBeVisible();
    await expect(page.locator('.app-error')).toContainText(/error/i);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();

    // Form should be readable on mobile
    const form = page.locator('form');
    const formBox = await form.boundingBox();
    expect(formBox?.width).toBeLessThanOrEqual(375);
  });
});

test.describe('Chart Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Run a simulation
    await page.selectOption('select[name="assetPair"]', 'ETH-USD');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="investmentAmount"]', '200');
    await page.selectOption('select[name="frequency"]', 'biweekly');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.chart-container')).toBeVisible({ timeout: 30000 });
  });

  test('should display chart legend', async ({ page }) => {
    await expect(page.locator('text=Portfolio Value')).toBeVisible();
    await expect(page.locator('text=Total Invested')).toBeVisible();
  });

  test('should show tooltips on hover', async ({ page }) => {
    const canvas = page.locator('canvas');
    await canvas.hover({ position: { x: 100, y: 100 } });
    
    // Chart.js tooltips should be visible
    // Note: This may need to wait for tooltip animation
    await page.waitForTimeout(500);
  });
});
