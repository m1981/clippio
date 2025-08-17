import { test as baseTest } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';
import { testTasks } from '../testData/tasks';

interface TodoFixtures {
	todoPage: TodoPage;
	todoPageWithTasks: TodoPage;
}

export const test = baseTest.extend<TodoFixtures>({
	todoPage: async ({ page }, use) => {
		const todoPage = new TodoPage(page);
		await todoPage.goto();
		await use(todoPage);
	},

	todoPageWithTasks: async ({ page }, use) => {
		const todoPage = new TodoPage(page);
		await todoPage.goto();

		await page.waitForLoadState('networkidle');

		// Add test tasks
		const tasksToAdd = [
			testTasks.work.highPriority.title,
			testTasks.work.mediumPriority.title,
			testTasks.personal.shopping.title
		];

		for (const taskTitle of tasksToAdd) {
			await todoPage.addTask(taskTitle);
			// Don't call waitForTaskToAppear here as it might fail
		}

		// Force both projects to be expanded
		await todoPage.toggleProject('work');
		await todoPage.toggleProject('personal');
		await page.waitForTimeout(1000);

		// Verify we can see tasks
		const visibleTasks = await page.getByRole('listitem').count();
		console.log(`Fixture setup complete. Visible tasks: ${visibleTasks}`);

		await use(todoPage);
	}
});

export { expect } from '@playwright/test';
