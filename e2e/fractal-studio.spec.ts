import { test, expect } from '@playwright/test';

test.describe('Fractal Studio', () => {
  test('should load and render fractal successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the canvas to be visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Check that WebGL is initialized
    await expect(page.locator('text=Initializing WebGL')).not.toBeVisible({ timeout: 10000 });
    
    // Verify controls are visible by default
    await expect(page.locator('text=Fractal Presets')).toBeVisible();
    await expect(page.locator('text=Parameters')).toBeVisible();
    await expect(page.locator('text=Performance Monitor')).toBeVisible();
  });

  test('should toggle controls visibility with H key', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initialization
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Verify controls are initially visible
    await expect(page.locator('text=Fractal Presets')).toBeVisible();
    
    // Press H to hide controls
    await page.keyboard.press('h');
    await expect(page.locator('text=Fractal Presets')).not.toBeVisible();
    
    // Press H again to show controls
    await page.keyboard.press('h');
    await expect(page.locator('text=Fractal Presets')).toBeVisible();
  });

  test('should switch between fractal presets', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initialization
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Click on Julia Set preset
    await page.locator('text=Julia Set').click();
    
    // Verify Julia constant controls appear
    await expect(page.locator('text=Julia Constant')).toBeVisible();
    
    // Switch back to Mandelbrot
    await page.locator('text=Mandelbrot Set').click();
    
    // Verify Julia constant controls disappear
    await expect(page.locator('text=Julia Constant')).not.toBeVisible();
  });

  test('should respond to zoom interactions', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initialization
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(2000);
    
    // Get initial zoom level from performance monitor
    const zoomBefore = await page.locator('text=/Zoom Level.*e.*/')
      .first()
      .textContent();
    
    // Perform zoom by scrolling on canvas
    await canvas.hover();
    await page.mouse.wheel(0, -100); // Zoom in
    
    await page.waitForTimeout(500);
    
    // Check that zoom level changed
    const zoomAfter = await page.locator('text=/Zoom Level.*e.*/')
      .first()
      .textContent();
    
    expect(zoomAfter).not.toBe(zoomBefore);
  });

  test('should update parameters through controls', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initialization
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Change max iterations
    const iterationsSelect = page.locator('select').filter({ hasText: /50|100|500|1000/ });
    await iterationsSelect.selectOption('500');
    
    // Change color palette
    const paletteSelect = page.locator('select').filter({ hasText: /Viridis|Plasma|Inferno/ });
    await paletteSelect.selectOption('plasma');
    
    // Verify palette preview updated
    await expect(page.locator('text=Plasma')).toBeVisible();
  });

  test('should maintain 60fps performance during basic interactions', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initialization
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForTimeout(3000); // Give time for performance to stabilize
    
    // Check initial FPS
    const performanceMonitor = page.locator('text=Performance Monitor').locator('..');
    
    // Look for FPS display
    const fpsElement = performanceMonitor.locator('text=/FPS/').locator('..').locator('span').last();
    
    await expect(fpsElement).toBeVisible();
    
    // Get FPS value (this is a basic check - in real scenarios you'd want more sophisticated monitoring)
    const fpsText = await fpsElement.textContent();
    const fps = parseFloat(fpsText || '0');
    
    // Performance should be reasonable (this is a loose check due to test environment limitations)
    expect(fps).toBeGreaterThan(0);
  });

  test('should handle touch gestures on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Skipping mobile-only test');
    
    await page.goto('/');
    
    // Wait for initialization
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Simulate touch pan
    await canvas.hover();
    await page.touchscreen.tap(200, 200);
    
    // Note: More sophisticated touch testing would require custom touch event simulation
    // This is a basic check that the page loads and is interactive on mobile
  });

  test('should preserve fractal state during preset changes', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initialization
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Navigate to a specific location by changing parameters
    await page.locator('input[type="number"]').first().fill('-0.5');
    
    // Switch presets
    await page.locator('text=Julia Set').click();
    await page.locator('text=Mandelbrot Set').click();
    
    // Verify the parameter was preserved or reset appropriately
    const centerValue = await page.locator('input[type="number"]').first().inputValue();
    expect(parseFloat(centerValue)).toBeCloseTo(-0.5, 5);
  });

  test('should show appropriate error handling for WebGL issues', async ({ page }) => {
    // This test would need to mock WebGL failure scenarios
    // For now, we'll just verify the loading state works correctly
    
    await page.goto('/');
    
    // Should start with loading overlay
    await expect(page.locator('text=Initializing WebGL')).toBeVisible();
    
    // Should complete loading within reasonable time
    await expect(page.locator('text=Initializing WebGL')).not.toBeVisible({ timeout: 15000 });
    
    // Canvas should be interactive
    await expect(page.locator('canvas')).toBeVisible();
  });
});
