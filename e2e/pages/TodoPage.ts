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
    await this.page.locator(selectors.acceptSuggestion).click();
  }

  async rejectAISuggestion() {
    await this.page.locator(selectors.rejectSuggestion).click();
  }

  async getTaskByTitle(title: string) {
    // Use listitem role instead of missing data-testid
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  async toggleTask(title: string) {
    const task = await this.getTaskByTitle(title);
    // Use actual checkbox selector instead of missing data-testid
    await task.locator('input[type="checkbox"]').click();
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

  async toggleProject(project: 'work' | 'personal') {
    const projectHeader = project === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    await projectHeader.click();
  }

  async getTaskCount(project: 'work' | 'personal'): Promise<number> {
    const projectHeader = project === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    const text = await projectHeader.textContent();
    const match = text?.match(/(\d+) tasks/);
    return match ? parseInt(match[1]) : 0;
  }

  async isProjectExpanded(project: 'work' | 'personal'): Promise<boolean> {
    const projectHeader = project === 'work' ? this.workProjectsHeader : this.personalProjectsHeader;
    const text = await projectHeader.textContent();
    return text?.includes('▼') || false;
  }
}