import { Page, Locator, expect } from '@playwright/test';

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
    
    // Use data-testid selectors as per principle #2
    this.taskInput = page.locator('[data-testid="task-input"]');
    this.addTaskButton = page.locator('[data-testid="add-task-button"]');
    this.projectList = page.locator('[data-testid="project-list"]');
    this.aiSuggestion = page.locator('[data-testid="ai-suggestion"]');
    
    this.workProjectsHeader = page.locator('[data-testid="project-header-work"]');
    this.personalProjectsHeader = page.locator('[data-testid="project-header-personal"]');
  }

  async goto() {
    await this.page.goto('/todo');
  }

  async addTask(title: string) {
    await this.taskInput.fill(title);
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
    await this.aiSuggestion.locator('[data-testid="accept-suggestion"]').click();
  }

  async rejectAISuggestion() {
    await this.aiSuggestion.locator('[data-testid="reject-suggestion"]').click();
  }

  async getTaskByTitle(title: string): Promise<Locator> {
    return this.page.locator(`[data-testid="task-item"]`).filter({ hasText: title });
  }

  async toggleTask(title: string) {
    const task = await this.getTaskByTitle(title);
    await task.locator('[data-testid="task-checkbox"]').click();
  }

  async openTaskContextMenu(title: string) {
    const task = await this.getTaskByTitle(title);
    await task.locator('[data-testid="task-menu-button"]').click();
  }

  async rightClickTask(title: string) {
    const task = await this.getTaskByTitle(title);
    await task.click({ button: 'right' });
  }

  async deleteTaskFromMenu(title: string) {
    await this.openTaskContextMenu(title);
    await this.page.locator('[data-testid="delete-task-option"]').click();
  }

  async setTaskPriority(title: string, priority: 'high' | 'medium' | 'low') {
    await this.openTaskContextMenu(title);
    await this.page.locator(`[data-testid="priority-${priority}"]`).click();
  }

  async toggleProject(projectName: 'work' | 'personal') {
    const header = projectName === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    await header.click();
  }

  async getTaskCount(projectName: 'work' | 'personal'): Promise<number> {
    const header = projectName === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    const countText = await header.locator('[data-testid="task-count"]').textContent();
    return parseInt(countText || '0');
  }

  async isProjectExpanded(projectName: 'work' | 'personal'): Promise<boolean> {
    const header = projectName === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    const expanded = await header.getAttribute('aria-expanded');
    return expanded === 'true';
  }
}