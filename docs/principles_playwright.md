# Principles for Maintainable Playwright Tests

## 1. Use the Page Object Model (POM)
```typescript
// Example: pages/LoginPage.ts
export class LoginPage {
  private page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  async login(username: string, password: string) {
    await this.page.fill('[data-testid="username"]', username);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');
  }
}
```

## 2. Prefer Data-Testid Selectors
```typescript
// Prefer this:
await page.click('[data-testid="submit-button"]');

// Over this:
await page.click('.submit-btn'); // CSS classes may change
await page.click('button:has-text("Submit")'); // Text may change
```

## 3. Create Reusable Test Fixtures
```typescript
// fixtures.ts
export const test = baseTest.extend({
  loggedInPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await use(page);
  }
});
```

## 4. Implement Strong Typing
```typescript
// types.ts
export interface UserData {
  username: string;
  password: string;
  role: 'admin' | 'user' | 'guest';
}

// Using the type in page objects
import { UserData } from '../types';

export class LoginPage {
  private page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  async login(userData: UserData) {
    await this.page.fill('[data-testid="username"]', userData.username);
    await this.page.fill('[data-testid="password"]', userData.password);
    await this.page.click('[data-testid="login-button"]');
  }
}
```


## 5. Isolate Test Data
```typescript
// testData/users.ts
export const testUsers = {
  admin: { username: 'admin1', password: 'securePass1', role: 'admin' },
  regularUser: { username: 'user1', password: 'userPass1', role: 'user' }
};

// In your test:
import { testUsers } from '../testData/users';
test('admin can access settings', async ({ page }) => {
  await loginPage.login(testUsers.admin.username, testUsers.admin.password);
  // Test continues...
});
```

## 6. Implement Robust Wait Strategies
```typescript
// Instead of:
await page.click('[data-testid="submit"]');
await page.waitForTimeout(2000); // Arbitrary delay = flaky tests

// Prefer:
await page.click('[data-testid="submit"]');
await page.waitForSelector('[data-testid="success-message"]');
// Or even better:
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
```

## 7. Group Related Tests with describe()
```typescript
describe('Shopping cart', () => {
  test('adding items to cart', async ({ page }) => {
    // Test implementation
  });
  
  test('removing items from cart', async ({ page }) => {
    // Test implementation
  });
});
```

## 8. Use Visual Testing Strategically
```typescript
test('dashboard layout', async ({ page }) => {
  await page.goto('/dashboard');
  // Only snapshot specific components, not entire pages when possible
  await expect(page.locator('.chart-container')).toHaveScreenshot('dashboard-chart.png');
});
```

## 9. Implement Custom Commands for Common Workflows
```typescript
// commands/navigation.ts
export async function navigateThroughMenu(page: Page, menuPath: string[]) {
  for (const item of menuPath) {
    await page.click(`[data-testid="menu-item-${item}"]`);
  }
}
```

## 10. Parameterize Tests When Possible
```typescript
const products = ['Phone', 'Laptop', 'Tablet'];
for (const product of products) {
  test(`should be able to search for ${product}`, async ({ page }) => {
    await page.goto('/products');
    await page.fill('[data-testid="search-input"]', product);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toContainText(product);
  });
}
```

## 11. Implement Proper Test Cleanup
```typescript
test('user management test', async ({ page, request }) => {
  // Create test data
  const userId = await createTestUser(request);
  
  try {
    // Run your test
    await page.goto(`/users/${userId}`);
    // Test actions...
  } finally {
    // Always clean up, even if the test fails
    await deleteTestUser(request, userId);
  }
});
```

## 12. Use API Calls for Test Setup When Possible
```typescript
test('editing user profile', async ({ page, request }) => {
  // Setup via API instead of UI steps
  const authToken = await getAuthToken(request);
  await request.post('/api/users', {
    headers: { 'Authorization': `Bearer ${authToken}` },
    data: { name: 'Test User', email: 'test@example.com' }
  });
  
  // Now test just the UI part you're interested in
  await page.goto('/profile');
  // Continue test...
});
```

## 13. Implement Smart Retries for Flaky Operations
```typescript
async function retryOperation(fn: () => Promise<void>, maxAttempts = 3) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      await fn();
      return;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) throw error;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// Usage
await retryOperation(async () => {
  await page.click('[data-testid="sometimes-flaky-button"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

## 14. Create Environmental Configuration
```typescript
// config.ts
export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3001/api',
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
};

// Usage
test('navigate to home', async ({ page }) => {
  await page.goto(config.baseUrl);
});
```

## 15. Implement Logging for Debugging
```typescript
// logger.ts
export const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.log(`[WARN] ${message}`),
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`);
    if (error) console.error(error);
  }
};

// Usage in tests
test('important workflow', async ({ page }) => {
  logger.info('Starting important workflow test');
  await page.goto('/dashboard');
  logger.info('Successfully navigated to dashboard');
  // More test steps...
});
```

## 16. Use Soft Assertions When Appropriate
```typescript
test('page contains multiple expected elements', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Instead of failing on first assertion error, collect all errors
  await expect.soft(page.locator('[data-testid="header"]')).toBeVisible();
  await expect.soft(page.locator('[data-testid="sidebar"]')).toBeVisible();
  await expect.soft(page.locator('[data-testid="main-content"]')).toBeVisible();
  await expect.soft(page.locator('[data-testid="footer"]')).toBeVisible();
});
```

## 17. Tag Tests for Better Organization
```typescript
test('basic user can view products @smoke @regression', async ({ page }) => {
  // Test implementation
});

test('admin can manage inventory @admin @regression', async ({ page }) => {
  // Test implementation
});

// Run with: npx playwright test --grep "@smoke"
```

## 18. Implement Custom Matchers for Domain-Specific Assertions
```typescript
// customMatchers.ts
export const customMatchers = {
  async toHaveValidProductCard(locator: Locator) {
    const content = await locator.textContent();
    const hasImage = await locator.locator('img').count() > 0;
    const hasPrice = /\$\d+\.\d{2}/.test(content || '');
    
    return {
      pass: hasImage && hasPrice,
      message: () => `Expected product card to have image and valid price format`
    };
  }
};

// Usage
expect.extend(customMatchers);
await expect(page.locator('[data-testid="product-card"]')).toHaveValidProductCard();
```

## 19. Create a Test Report Utility
```typescript
// reporter.ts
import { Reporter } from '@playwright/test/reporter';

class CustomReporter implements Reporter {
  onBegin(config, suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }
  
  onTestBegin(test) {
    console.log(`Starting test ${test.title}`);
  }
  
  onTestEnd(test, result) {
    console.log(`Finished test ${test.title}: ${result.status}`);
  }
  
  onEnd(result) {
    console.log(`Finished the run: ${result.status}`);
  }
}

export default CustomReporter;

// In playwright.config.ts
import CustomReporter from './reporter';

export default defineConfig({
  reporter: [
    ['html'],
    ['list'],
    ['./reporter.ts']
  ],
  // other config...
});
```