import { test, expect } from '@playwright/test';

// 测试不同屏幕尺寸下的布局
test.describe('响应式布局测试', () => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: '临界点 560px', width: 560, height: 900 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: '桌面 1200px', width: 1200, height: 800 },
  ];

  for (const viewport of viewports) {
    test(`${viewport.name} (${viewport.width}px) 布局正常`, async ({ page }) => {
      // 设置视口大小
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      // 访问页面
      await page.goto('http://localhost:5173');

      // 等待内容加载
      await page.waitForSelector('.card', { timeout: 10000 });

      // 截图保存
      await page.screenshot({
        path: `screenshots/${viewport.width}px-${viewport.name}.png`,
        fullPage: true,
      });

      // 验证卡片存在
      const cards = await page.locator('.card').count();
      expect(cards).toBe(3); // 三个平台卡片

      // 验证标题可见
      await expect(page.locator('text=知乎')).toBeVisible();
      await expect(page.locator('text=B站')).toBeVisible();
      await expect(page.locator('text=微博')).toBeVisible();

      // 手机端验证单列布局
      if (viewport.width < 560) {
        // 获取第一个卡片的位置
        const firstCard = await page.locator('.card').first();
        const secondCard = await page.locator('.card').nth(1);

        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        // 验证垂直排列（第二个卡片在第一个下方）
        expect(secondBox!.y).toBeGreaterThan(firstBox!.y);

        // 验证卡片宽度接近视口宽度
        expect(firstBox!.width).toBeLessThan(viewport.width);
      }

      // 桌面端验证三列布局
      if (viewport.width >= 1200) {
        const cards = await page.locator('.card').all();
        const boxes = await Promise.all(
          cards.map(card => card.boundingBox())
        );

        // 三个卡片应该在同一行（y坐标相近）
        const yPositions = boxes.map(box => box!.y);
        const maxDiff = Math.max(...yPositions) - Math.min(...yPositions);
        expect(maxDiff).toBeLessThan(50); // 允许50px误差
      }
    });
  }

  test('移动端点击区域足够大', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.card', { timeout: 10000 });

    // 获取第一条热搜的点击区域
    const firstItem = await page.locator('.item').first();
    const box = await firstItem.boundingBox();

    // 验证高度至少44px（Apple人机交互指南推荐）
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('字体大小在移动端合适', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.card', { timeout: 10000 });

    // 获取标题字体大小
    const title = await page.locator('.title').first();
    const fontSize = await title.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });

    // 验证字体大小不小于12px
    const sizeInPx = parseInt(fontSize);
    expect(sizeInPx).toBeGreaterThanOrEqual(12);
  });
});
