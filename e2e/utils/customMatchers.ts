import { expect, Locator } from '@playwright/test';

export const todoMatchers = {
  async toHaveTaskCount(locator: Locator, expectedCount: number) {
    const countText = await locator.locator('[data-testid="task-count"]').textContent();
    const actualCount = parseInt(countText?.match(/\d+/)?.[0] || '0');
    
    return {
      pass: actualCount === expectedCount,
      message: () => `Expected task count to be ${expectedCount}, but got ${actualCount}`
    };
  },

  async toBeCompletedTask(locator: Locator) {
    const checkbox = locator.locator('input[type="checkbox"]');
    const isChecked = await checkbox.isChecked();
    const titleElement = locator.locator('[data-testid="task-title"]');
    const hasStrikethrough = await titleElement.evaluate(el => 
      getComputedStyle(el).textDecoration.includes('line-through')
    );
    
    return {
      pass: isChecked && hasStrikethrough,
      message: () => `Expected task to be completed (checked and strikethrough)`
    };
  }
};

// Extend expect with custom matchers
expect.extend(todoMatchers);