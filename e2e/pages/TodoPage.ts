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
    
    this.workProjectsHeader = page.getByRole('button', { name: /Work Projects/ });
    this.personalProjectsHeader = page.getByRole('button', { name: /Personal/ });
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
    await this.page.locator(selectors.addTaskButton).click();
  }

  async rejectAISuggestion() {
    await this.page.locator(selectors.rejectSuggestion).click();
  }

  async getTaskByTitle(title: string) {
    // Use accessible role-based selector instead of data-testid
    return this.page.locator(`listitem`).filter({ hasText: title });
  }

  async toggleTask(title: string) {
    const task = await this.getTaskByTitle(title);
    await task.locator(selectors.taskCheckbox).click();
  }

  async openTaskContextMenu(title: string) {
    const task = await this.getTaskByTitle(title);
    await task.locator(selectors.taskMenuButton).click();
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
    await this.page.locator(selectors[`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}` as keyof typeof selectors]).click();
  }

  async toggleProject(projectName: 'work' | 'personal') {
    const header = projectName === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    await header.click();
  }

  async getTaskCount(projectName: 'work' | 'personal'): Promise<number> {
    const header = projectName === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    const countText = await header.locator(selectors.taskCount).textContent();
    return parseInt(countText || '0');
  }

  async isProjectExpanded(projectName: 'work' | 'personal'): Promise<boolean> {
    const header = projectName === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    const expanded = await header.getAttribute('aria-expanded');
    return expanded === 'true';
  }
}