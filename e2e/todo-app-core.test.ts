import { test, expect } from './fixtures/todoFixtures';
import { testTasks, aiSuggestionTasks } from './testData/tasks';
import { testConfig } from './config/testConfig';

test.describe('TodoApp - Core Functionality', () => {
  test('should display todo app interface @smoke', async ({ todoPage }) => {
    // Verify main components are present
    await expect(todoPage.taskInput).toBeVisible();
    await expect(todoPage.addTaskButton).toBeVisible();
    await expect(todoPage.projectList).toBeVisible();
    
    // Verify default projects exist
    await expect(todoPage.workProjectsHeader).toBeVisible();
    await expect(todoPage.personalProjectsHeader).toBeVisible();
    
    // Verify initial state
    await expect(todoPage.workProjectsHeader).toContainText('Work Projects');
    await expect(todoPage.personalProjectsHeader).toContainText('Personal');
  });

  test('should create a new task with button click', async ({ todoPage }) => {
    const taskTitle = testTasks.work.highPriority.title;
    
    await todoPage.addTask(taskTitle);
    
    // Use robust wait strategy (principle #6)
    const task = await todoPage.getTaskByTitle(taskTitle);
    await expect(task).toBeVisible();
    await expect(task).toContainText(taskTitle);
    
    // Verify task appears in correct project (default should be work)
    const workTaskCount = await todoPage.getTaskCount('work');
    expect(workTaskCount).toBeGreaterThan(0);
  });

  test('should create a new task with Enter key @keyboard', async ({ todoPage }) => {
    const taskTitle = testTasks.personal.shopping.title;
    
    await todoPage.addTaskWithEnter(taskTitle);
    
    const task = await todoPage.getTaskByTitle(taskTitle);
    await expect(task).toBeVisible();
    
    // Verify input is cleared after adding
    await expect(todoPage.taskInput).toHaveValue('');
  });

  test('should toggle task completion', async ({ todoPageWithTasks }) => {
    const taskTitle = testTasks.work.highPriority.title;
    const task = await todoPageWithTasks.getTaskByTitle(taskTitle);
    
    // Initially task should be incomplete
    await expect(task.locator('[data-testid="task-checkbox"]')).not.toBeChecked();
    
    // Toggle to complete
    await todoPageWithTasks.toggleTask(taskTitle);
    await expect(task.locator('[data-testid="task-checkbox"]')).toBeChecked();
    
    // Verify visual indication of completion
    await expect(task.locator('span')).toHaveClass(/line-through/);
    
    // Toggle back to incomplete
    await todoPageWithTasks.toggleTask(taskTitle);
    await expect(task.locator('[data-testid="task-checkbox"]')).not.toBeChecked();
  });
});

test.describe('TodoApp - Context Menu', () => {
  test('should open context menu with three-dot button', async ({ todoPageWithTasks }) => {
    const taskTitle = testTasks.work.mediumPriority.title;
    
    await todoPageWithTasks.openTaskContextMenu(taskTitle);
    
    // Verify context menu appears
    const contextMenu = todoPageWithTasks.page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();
    
    // Verify menu options are present
    await expect(contextMenu.locator('[data-testid="edit-task-option"]')).toBeVisible();
    await expect(contextMenu.locator('[data-testid="delete-task-option"]')).toBeVisible();
    await expect(contextMenu.locator('[data-testid="priority-high"]')).toBeVisible();
  });

  test('should open context menu with right-click', async ({ todoPageWithTasks }) => {
    const taskTitle = testTasks.personal.shopping.title;
    
    await todoPageWithTasks.rightClickTask(taskTitle);
    
    const contextMenu = todoPageWithTasks.page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();
  });

  test('should delete task from context menu', async ({ todoPageWithTasks }) => {
    const taskTitle = testTasks.work.highPriority.title;
    
    // Verify task exists first
    const task = await todoPageWithTasks.getTaskByTitle(taskTitle);
    await expect(task).toBeVisible();
    
    // Delete via context menu
    await todoPageWithTasks.deleteTaskFromMenu(taskTitle);
    
    // Verify task is removed
    await expect(task).not.toBeVisible();
  });

  test('should change task priority from context menu', async ({ todoPageWithTasks }) => {
    const taskTitle = testTasks.work.mediumPriority.title;
    
    await todoPageWithTasks.setTaskPriority(taskTitle, 'high');
    
    const task = await todoPageWithTasks.getTaskByTitle(taskTitle);
    const priorityBadge = task.locator('[data-testid="priority-badge"]');
    
    await expect(priorityBadge).toContainText('high');
    await expect(priorityBadge).toHaveClass(/bg-red-100/); // High priority styling
  });
});

test.describe('TodoApp - AI Suggestions', () => {
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
});

test.describe('TodoApp - Project Management', () => {
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