export const testConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:4173',
  apiUrl: process.env.API_URL || 'http://localhost:4173/api',
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
  aiSuggestionTimeout: parseInt(process.env.AI_TIMEOUT || '5000'),
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
} as const;

export const selectors = {
  // Task-related selectors
  taskInput: '[data-testid="task-input"]',
  addTaskButton: '[data-testid="add-task-button"]',
  taskItem: '[data-testid="task-item"]',
  taskCheckbox: '[data-testid="task-checkbox"]',
  taskMenuButton: '[data-testid="task-menu-button"]',
  
  // Project-related selectors
  projectList: '[data-testid="project-list"]',
  projectHeader: '[data-testid^="project-header-"]',
  taskCount: '[data-testid="task-count"]',
  
  // AI suggestion selectors
  aiSuggestion: '[data-testid="ai-suggestion"]',
  acceptSuggestion: '[data-testid="accept-suggestion"]',
  rejectSuggestion: '[data-testid="reject-suggestion"]',
  
  // Context menu selectors
  contextMenu: '[data-testid="context-menu"]',
  deleteTaskOption: '[data-testid="delete-task-option"]',
  editTaskOption: '[data-testid="edit-task-option"]',
  priorityHigh: '[data-testid="priority-high"]',
  priorityMedium: '[data-testid="priority-medium"]',
  priorityLow: '[data-testid="priority-low"]',
} as const;