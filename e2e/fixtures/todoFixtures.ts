import { test as baseTest } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';
import { testTasks } from '../testData/tasks';
import { testConfig } from '../config/testConfig';

type TodoFixtures = {
  todoPage: TodoPage;
  todoPageWithTasks: TodoPage;
};

export const test = baseTest.extend<TodoFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },

  todoPageWithTasks: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    
    // Wait for page to be ready before adding tasks
    await page.waitForLoadState('networkidle');
    
    // Add test tasks with proper error handling
    try {
      await todoPage.addTask(testTasks.work.highPriority.title);
      await todoPage.addTask(testTasks.work.mediumPriority.title);
      await todoPage.addTask(testTasks.personal.shopping.title);
    } catch (error) {
      console.error('Failed to add test tasks:', error);
      throw error;
    }
    
    await use(todoPage);
  }
});

export { expect } from '@playwright/test';