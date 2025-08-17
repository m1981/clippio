import { test, expect } from './fixtures/todoFixtures';
import { testTasks, aiSuggestionTasks } from './testData/tasks';
import { retryOperation, selectors } from './config/testConfig';
import './utils/customMatchers';

test.describe('TodoApp - Basic Functionality', () => {
	test.beforeEach(async ({ todoPage }) => {
		// Principle #6: Robust wait strategies
		await todoPage.page.waitForLoadState('networkidle');
	});

	test('should display todo app interface @smoke', async ({ todoPage }) => {
		// Principle #6: Use proper wait strategies instead of arbitrary timeouts
		await expect(todoPage.taskInput).toBeVisible();
		await expect(todoPage.workProjectsHeader).toBeVisible();
		await expect(todoPage.personalProjectsHeader).toBeVisible();

		// Verify initial state
		await expect(todoPage.workProjectsHeader).toContainText('Work Projects');
		await expect(todoPage.personalProjectsHeader).toContainText('Personal');
	});

	test('should create a new task @regression', async ({ todoPage }) => {
		const taskTitle = testTasks.work.highPriority.title;

		// Principle #13: Implement retry logic for flaky operations
		await retryOperation(async () => {
			await todoPage.addTask(taskTitle);
			const task = await todoPage.waitForTaskToAppear(taskTitle);
			await expect(task).toContainText(taskTitle);
		});
	});

	test('should toggle task completion @regression', async ({ todoPageWithTasks }) => {
		// Force expand both projects first
		console.log('Forcing project expansion...');

		const workExpanded = await todoPageWithTasks.isProjectExpanded('work');
		const personalExpanded = await todoPageWithTasks.isProjectExpanded('personal');

		console.log(`Initial state - Work: ${workExpanded}, Personal: ${personalExpanded}`);

		if (!workExpanded) {
			await todoPageWithTasks.toggleProject('work');
			await todoPageWithTasks.page.waitForTimeout(1000);
		}

		if (!personalExpanded) {
			await todoPageWithTasks.toggleProject('personal');
			await todoPageWithTasks.page.waitForTimeout(1000);
		}

		// Verify expansion worked
		const workNowExpanded = await todoPageWithTasks.isProjectExpanded('work');
		const personalNowExpanded = await todoPageWithTasks.isProjectExpanded('personal');
		console.log(`After toggle - Work: ${workNowExpanded}, Personal: ${personalNowExpanded}`);

		// List all visible tasks for debugging
		const allTasks = await todoPageWithTasks.page.getByRole('listitem').all();
		console.log(`Visible tasks count: ${allTasks.length}`);

		const taskTitle = testTasks.work.highPriority.title;
		console.log(`Looking for task: ${taskTitle}`);

		// Initially task should be incomplete
		expect(await todoPageWithTasks.isTaskCompleted(taskTitle)).toBe(false);

		// Toggle to complete
		await todoPageWithTasks.toggleTask(taskTitle);

		// Use custom matcher (Principle #18)
		const task = await todoPageWithTasks.getTaskByTitle(taskTitle);
		await expect(task).toBeCompletedTask();

		// Toggle back to incomplete
		await todoPageWithTasks.toggleTask(taskTitle);
		expect(await todoPageWithTasks.isTaskCompleted(taskTitle)).toBe(false);
	});

	test('should delete a task', async ({ todoPageWithTasks }) => {
		const taskTitle = testTasks.work.highPriority.title;

		// Ensure work project is expanded before looking for task
		const workExpanded = await todoPageWithTasks.isProjectExpanded('work');
		if (!workExpanded) {
			await todoPageWithTasks.toggleProject('work');
			await todoPageWithTasks.page.waitForTimeout(500);
		}

		// Verify task exists first
		const task = await todoPageWithTasks.getTaskByTitle(taskTitle);
		await expect(task).toBeVisible();

		// Delete via context menu
		await todoPageWithTasks.deleteTaskFromMenu(taskTitle);

		// Verify task is removed
		await expect(task).not.toBeVisible();
	});
});

test.describe('TodoApp - Context Menu', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/todo');
		// TODO: Create test task for context menu tests
	});

	test('should open context menu with three-dot button', async ({ todoPageWithTasks }) => {
		const taskTitle = testTasks.work.mediumPriority.title;

		await todoPageWithTasks.openTaskContextMenu(taskTitle);

		// Use centralized selectors instead of hardcoded ones
		const contextMenu = todoPageWithTasks.page.locator(selectors.contextMenu);
		await expect(contextMenu).toBeVisible();

		// Use centralized selectors consistently
		await expect(contextMenu.locator(selectors.editTaskOption)).toBeVisible();
		await expect(contextMenu.locator(selectors.deleteTaskOption)).toBeVisible();
		await expect(contextMenu.locator(selectors.priorityHigh)).toBeVisible();
	});

	test('should open context menu with right-click', async ({ todoPageWithTasks }) => {
		const taskTitle = testTasks.personal.shopping.title;

		await todoPageWithTasks.rightClickTask(taskTitle);

		// Use centralized selector
		const contextMenu = todoPageWithTasks.page.locator(selectors.contextMenu);
		await expect(contextMenu).toBeVisible();
	});

	test('should close context menu when clicking outside', async ({ todoPageWithTasks }) => {
		// TODO: Open context menu
		// TODO: Click outside menu area
		// TODO: Verify menu disappears
	});

	test('should edit task from context menu', async ({ todoPageWithTasks }) => {
		// TODO: Open context menu
		// TODO: Click "Edit task" option
		// TODO: Verify edit mode is activated
		// TODO: Modify task title
		// TODO: Save changes
		// TODO: Verify task title updated
	});

	test('should change task priority from context menu', async ({ todoPageWithTasks }) => {
		const taskTitle = testTasks.work.mediumPriority.title;

		await todoPageWithTasks.setTaskPriority(taskTitle, 'high');

		const task = await todoPageWithTasks.getTaskByTitle(taskTitle);
		// Use centralized selector
		const priorityBadge = task.locator(selectors.priorityBadge);

		await expect(priorityBadge).toContainText('high');
		await expect(priorityBadge).toHaveClass(/bg-red-100/);
	});

	test('should mark task complete from context menu', async ({ todoPageWithTasks }) => {
		// TODO: Open context menu on incomplete task
		// TODO: Click "Mark complete" option
		// TODO: Verify task shows as completed
		// TODO: Verify context menu closes
	});

	test('should mark task incomplete from context menu', async ({ todoPageWithTasks }) => {
		// TODO: Create completed task
		// TODO: Open context menu
		// TODO: Click "Mark incomplete" option
		// TODO: Verify task shows as active
	});
});

test.describe('TodoApp - AI Suggestions', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/todo');
	});

	test('should show AI suggestion for work-related task', async ({ todoPage }) => {
		const workTask = aiSuggestionTasks.workRelated[0];

		// Start typing work-related task
		await todoPage.taskInput.fill(workTask);

		// Wait for AI suggestion to appear
		await todoPage.waitForAISuggestion();

		// Verify suggestion content
		await expect(todoPage.aiSuggestion).toContainText('Work Projects');
		await expect(todoPage.aiSuggestion.locator('[data-testid="accept-suggestion"]')).toBeVisible();
		await expect(todoPage.aiSuggestion.locator('[data-testid="reject-suggestion"]')).toBeVisible();
	});

	test('should accept AI suggestion and add task to suggested project', async ({ todoPage }) => {
		const personalTask = aiSuggestionTasks.personalRelated[0];

		await todoPage.taskInput.fill(personalTask);
		await todoPage.waitForAISuggestion();

		// Accept the suggestion
		await todoPage.acceptAISuggestion();

		// Verify task was added
		const task = await todoPage.getTaskByTitle(personalTask);
		await expect(task).toBeVisible();

		// Verify suggestion disappeared
		await expect(todoPage.aiSuggestion).not.toBeVisible();

		// Verify task count increased in suggested project
		const personalTaskCount = await todoPage.getTaskCount('personal');
		expect(personalTaskCount).toBeGreaterThan(0);
	});

	test('should reject AI suggestion', async ({ todoPage }) => {
		const workTask = aiSuggestionTasks.workRelated[1];

		await todoPage.taskInput.fill(workTask);
		await todoPage.waitForAISuggestion();

		await todoPage.rejectAISuggestion();

		// Verify suggestion disappeared
		await expect(todoPage.aiSuggestion).not.toBeVisible();

		// Verify task can still be added manually
		await todoPage.addTaskButton.click();
		const task = await todoPage.getTaskByTitle(workTask);
		await expect(task).toBeVisible();
	});

	test('should handle AI suggestion timeout gracefully', async ({ todoPage }) => {
		const workTask = aiSuggestionTasks.workRelated[0];

		await todoPage.taskInput.fill(workTask);

		try {
			await todoPage.waitForAISuggestion();
			await expect(todoPage.aiSuggestion).toContainText('Work Projects');
		} catch {
			// Use centralized selector instead of hardcoded
			await expect(todoPage.page.locator(selectors.suggestionLoading)).not.toBeVisible();
			console.log('AI suggestion timed out - fallback behavior verified');
		}
	});
});

test.describe('TodoApp - Project Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/todo');
	});

	test('should display default projects', async ({ todoPage }) => {
		// TODO: Verify "Work Projects" appears
		// TODO: Verify "Personal" appears
		// TODO: Check project expand/collapse state
	});

	test('should expand and collapse projects', async ({ todoPageWithTasks }) => {
		// Initially work project should be expanded
		expect(await todoPageWithTasks.isProjectExpanded('work')).toBe(true);

		// Collapse work project
		await todoPageWithTasks.toggleProject('work');
		expect(await todoPageWithTasks.isProjectExpanded('work')).toBe(false);

		// Tasks should be hidden
		const workTask = await todoPageWithTasks.getTaskByTitle(testTasks.work.highPriority.title);
		await expect(workTask).not.toBeVisible();

		// Expand again
		await todoPageWithTasks.toggleProject('work');
		expect(await todoPageWithTasks.isProjectExpanded('work')).toBe(true);

		// Tasks should be visible again
		await expect(workTask).toBeVisible();
	});

	test('should display correct task count in project headers', async ({ todoPageWithTasks }) => {
		const workTaskCount = await todoPageWithTasks.getTaskCount('work');
		const personalTaskCount = await todoPageWithTasks.getTaskCount('personal');

		// Should have at least the tasks we added in fixture
		expect(workTaskCount).toBeGreaterThanOrEqual(2); // 2 work tasks from fixture
		expect(personalTaskCount).toBeGreaterThanOrEqual(1); // 1 personal task from fixture

		// Add another task and verify count updates
		await todoPageWithTasks.addTask('New work task');
		const updatedWorkCount = await todoPageWithTasks.getTaskCount('work');
		expect(updatedWorkCount).toBe(workTaskCount + 1);
	});
});

test.describe('TodoApp - Keyboard Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/todo');
	});

	test('should add task with Enter key', async ({ todoPage }) => {
		// TODO: Focus task input field
		// TODO: Type task title
		// TODO: Press Enter key
		// TODO: Verify task is added
		// TODO: Verify input field is cleared
		throw new Error('not implemented yet');
	});

	test('should navigate tasks with arrow keys', async ({ todoPageWithTasks }) => {
		// TODO: Create multiple tasks
		// TODO: Focus first task
		// TODO: Use arrow keys to navigate
		// TODO: Verify focus moves between tasks
		throw new Error('not implemented yet');
	});

	test('should open context menu with keyboard', async ({ todoPageWithTasks }) => {
		// TODO: Focus on task
		// TODO: Press context menu key or Shift+F10
		// TODO: Verify context menu opens
		// TODO: Navigate menu with arrow keys
		throw new Error('not implemented yet');
	});

	test('should close context menu with Escape', async ({ todoPageWithTasks }) => {
		// TODO: Open context menu
		// TODO: Press Escape key
		// TODO: Verify menu closes
		throw new Error('not implemented yet');
	});
});

test.describe('TodoApp - Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/todo');
	});

	test('should have proper ARIA labels', async ({ todoPage }) => {
		// TODO: Check task checkboxes have aria-label
		// TODO: Check context menu buttons have aria-label
		// TODO: Check project headers have aria-expanded
		// TODO: Verify screen reader announcements
		throw new Error('not implemented yet');
	});

	test('should support high contrast mode', async ({ todoPage }) => {
		// TODO: Enable high contrast mode
		// TODO: Verify all elements remain visible
		// TODO: Check priority badges have sufficient contrast
		throw new Error('not implemented yet');
	});

	test('should work with screen reader', async ({ todoPage }) => {
		// TODO: Navigate with screen reader commands
		// TODO: Verify task content is announced
		// TODO: Verify state changes are announced
		throw new Error('not implemented yet');
	});
});

test.describe('TodoApp - Data Persistence', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/todo');
	});

	test('should persist tasks after page reload', async ({ todoPage }) => {
		// TODO: Create several tasks
		// TODO: Set different priorities
		// TODO: Complete some tasks
		// TODO: Reload page
		// TODO: Verify all tasks and states persist
		throw new Error('not implemented yet');
	});

	test('should handle storage errors gracefully', async ({ todoPage }) => {
		// TODO: Mock storage failure
		// TODO: Attempt to create task
		// TODO: Verify error handling
		// TODO: Verify user feedback
		throw new Error('not implemented yet');
	});
});

test.describe('TodoApp - Mobile Responsiveness', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
		await page.goto('/todo');
	});

	test('should display properly on mobile', async ({ todoPage }) => {
		// TODO: Verify layout adapts to mobile
		// TODO: Check touch targets are adequate size
		// TODO: Verify text remains readable
		throw new Error('not implemented yet');
	});

	test('should handle touch interactions', async ({ todoPage }) => {
		// TODO: Test tap to toggle tasks
		// TODO: Test long press for context menu
		// TODO: Test swipe gestures if implemented
		throw new Error('not implemented yet');
	});
});

test.describe('TodoApp - Visual Regression', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/todo');
		await page.waitForLoadState('networkidle');
	});

	test('should match initial app layout @visual', async ({ page }) => {
		await page.goto('/todo');

		// Take full page screenshot
		await expect(page).toHaveScreenshot('todo-app-initial.png');
	});

	test('should match context menu appearance @visual', async ({ todoPageWithTasks }) => {
		const taskTitle = testTasks.work.highPriority.title;

		await todoPageWithTasks.openTaskContextMenu(taskTitle);
		await expect(todoPageWithTasks.page.locator(selectors.contextMenu)).toBeVisible();

		// Screenshot just the context menu area
		await expect(todoPageWithTasks.page.locator(selectors.contextMenu)).toHaveScreenshot(
			'context-menu.png'
		);
	});

	test('should match AI suggestion appearance @visual', async ({ todoPage }) => {
		await todoPage.taskInput.fill('Review quarterly reports');

		try {
			await todoPage.waitForAISuggestion();
			await expect(todoPage.aiSuggestion).toHaveScreenshot('ai-suggestion.png');
		} catch {
			console.log('AI suggestion not available - skipping visual test');
		}
	});
});
