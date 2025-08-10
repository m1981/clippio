import { Page, Locator, expect } from '@playwright/test';
import { selectors } from '../config/testConfig';

export class TodoPage {
  private page: Page;

  // Main components
  readonly taskInput: Locator;
  readonly addTaskButton: Locator;
  readonly projectList: Locator;
  readonly aiSuggestion: Locator;

  // Project sections
  readonly workProjectsHeader: Locator;
  readonly personalProjectsHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Use centralized selectors from testConfig
    this.taskInput = page.locator(selectors.taskInput);
    this.addTaskButton = page.locator(selectors.addTaskButton);
    this.projectList = page.locator(selectors.projectList);
    this.aiSuggestion = page.locator(selectors.aiSuggestion);
    
    // Use actual data-testid values from DOM
    this.workProjectsHeader = page.locator('[data-testid="project-header-work-projects"]');
    this.personalProjectsHeader = page.locator('[data-testid="project-header-personal"]');
  }

  async goto() {
    await this.page.goto('/todo');
  }

  async addTask(title: string) {
    await this.taskInput.fill(title);
    // Wait for add button to become visible after typing
    await expect(this.addTaskButton).toBeVisible();
    await this.addTaskButton.click();
  }

  async addTaskWithEnter(title: string) {
    await this.taskInput.fill(title);
    await this.taskInput.press('Enter');
  }

  async waitForAISuggestion() {
    await expect(this.aiSuggestion).toBeVisible({ timeout: 5000 });
  }

  async acceptAISuggestion() {
    await this.page.locator(selectors.acceptSuggestion).click();
  }

  async rejectAISuggestion() {
    await this.page.locator(selectors.rejectSuggestion).click();
  }

  async getTaskByTitle(title: string) {
    // Use role="button" since tasks are now interactive buttons, not list items
    return this.page.getByRole('button').filter({ hasText: title });
  }

  async toggleTask(title: string) {
    // Ensure project is expanded before trying to interact with task
    await this.ensureProjectExpanded(title);
    const task = await this.getTaskByTitle(title);
    await task.locator('input[type="checkbox"]').click();
  }

  async openTaskContextMenu(title: string) {
    // Ensure project is expanded before trying to interact with task
    await this.ensureProjectExpanded(title);
    
    const task = await this.getTaskByTitle(title);
    
    // Wait for task to be visible after expansion
    await expect(task).toBeVisible();
    
    // Hover over the task container to reveal the menu button
    await task.hover();
    
    // Wait for the menu button to become visible
    const menuButton = task.locator('button[aria-label*="Open task menu"]');
    await expect(menuButton).toBeVisible();
    
    // Click the menu button
    await menuButton.click();
    
    // Wait for context menu to appear
    await expect(this.page.locator('.dropdown-menu')).toBeVisible();
  }

  async rightClickTask(title: string) {
    const task = await this.getTaskByTitle(title);
    await task.click({ button: 'right' });
  }

  async deleteTaskFromMenu(title: string) {
    await this.openTaskContextMenu(title);
    await this.page.locator(selectors.deleteTaskOption).click();
  }

  async setTaskPriority(title: string, priority: 'high' | 'medium' | 'low') {
    await this.openTaskContextMenu(title);
    const prioritySelector = priority === 'high' ? selectors.priorityHigh :
                           priority === 'medium' ? selectors.priorityMedium :
                           selectors.priorityLow;
    await this.page.locator(prioritySelector).click();
  }

  async toggleProject(project: 'work' | 'personal') {
    const projectHeader = project === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    await projectHeader.click();
  }

  async getTaskCount(project: 'work' | 'personal'): Promise<number> {
    const projectSelector = project === 'work' ? 
      '[data-testid="project-header-work"]' : 
      '[data-testid="project-header-personal"]';
    
    const countElement = this.page.locator(projectSelector).locator(selectors.taskCount);
    const countText = await countElement.textContent();
    return parseInt(countText?.match(/\d+/)?.[0] || '0');
  }

  async isProjectExpanded(project: 'work' | 'personal'): Promise<boolean> {
    const projectHeader = project === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    
    // Now we can reliably use aria-expanded
    const ariaExpanded = await projectHeader.getAttribute('aria-expanded');
    return ariaExpanded === 'true';
  }

  async waitForTaskToAppear(title: string, timeout = 5000) {
    await this.ensureProjectExpanded(title);
    
    // Update to match the actual DOM structure
    const task = this.page.getByRole('button').filter({ hasText: title });
    await expect(task).toBeVisible({ timeout });
    return task;
  }

  async ensureProjectExpanded(taskTitle: string) {
    const personalTasks = ['Buy groceries', 'Go for a run', 'Pay electricity bill'];
    const isPersonalTask = personalTasks.includes(taskTitle);
    
    const project = isPersonalTask ? 'personal' : 'work';
    const isExpanded = await this.isProjectExpanded(project);
    
    console.log(`Project ${project} expanded: ${isExpanded} for task: ${taskTitle}`);
    
    if (!isExpanded) {
      console.log(`Expanding ${project} project...`);
      await this.toggleProject(project);
      await this.page.waitForTimeout(500); // Increase wait time
      
      // Verify expansion worked
      const nowExpanded = await this.isProjectExpanded(project);
      console.log(`After toggle, ${project} expanded: ${nowExpanded}`);
    }
  }

  async isTaskCompleted(title: string): Promise<boolean> {
    const task = await this.getTaskByTitle(title);
    const checkbox = task.locator('input[type="checkbox"]');
    return await checkbox.isChecked();
  }

  async editTaskTitle(oldTitle: string, newTitle: string) {
    await this.openTaskContextMenu(oldTitle);
    await this.page.locator(selectors.editTaskOption).click();
    
    // Wait for edit mode
    const editInput = this.page.locator('[data-testid="task-edit-input"]');
    await expect(editInput).toBeVisible();
    
    await editInput.fill(newTitle);
    await editInput.press('Enter');
  }
}