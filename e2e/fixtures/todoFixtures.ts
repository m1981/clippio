import { test as baseTest } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';
import { testTasks } from '../testData/tasks';

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
    
    // Add some test tasks for scenarios that need existing data
    await todoPage.addTask(testTasks.work.highPriority.title);
    await todoPage.addTask(testTasks.work.mediumPriority.title);
    await todoPage.addTask(testTasks.personal.shopping.title);
    
    await use(todoPage);
  }
});

export { expect } from '@playwright/test';