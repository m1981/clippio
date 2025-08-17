export const testConfig = {
	baseUrl: process.env.BASE_URL || 'http://localhost:5173',
	apiUrl: process.env.API_URL || 'http://localhost:5173/api',
	defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
	aiSuggestionTimeout: parseInt(process.env.AI_TIMEOUT || '5000'),
	retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3')
} as const;

// Retry utility function (Principle #13)
export async function retryOperation<T>(
	fn: () => Promise<T>,
	maxAttempts = testConfig.retryAttempts
): Promise<T> {
	let attempts = 0;
	while (attempts < maxAttempts) {
		try {
			return await fn();
		} catch (error) {
			attempts++;
			if (attempts >= maxAttempts) throw error;
			await new Promise((r) => setTimeout(r, 1000 * attempts));
		}
	}
	throw new Error('Max attempts reached');
}

export const selectors = {
	// Task-related selectors (consistent data-testid strategy)
	taskInput: '[data-testid="task-input"]',
	addTaskButton: '[data-testid="add-here-button"]',
	taskItem: '[data-testid="task-item"]',
	taskCheckbox: '[data-testid="task-checkbox"]',
	taskTitle: '[data-testid="task-title"]',
	taskMenuButton: 'button[aria-label*="Open task menu"]',
	taskEditInput: '[data-testid="task-edit-input"]',

	// Project-related selectors - use semantic names
	projectList: '[data-testid="project-list"]',
	projectHeaderWork: '[data-testid="project-header-work"]',
	projectHeaderPersonal: '[data-testid="project-header-personal"]',
	taskCount: '[data-testid="task-count"]',

	// Generic project header pattern
	projectHeader: (type: string) => `[data-testid="project-header-${type}"]`,

	// Role-based selectors (most resilient)
	projectHeaderByName: (name: string) => `button:has-text("${name}")`,

	// AI suggestion selectors
	aiSuggestion: '[data-testid="ai-suggestion"]',
	acceptSuggestion: '[data-testid="accept-suggestion"]',
	rejectSuggestion: '[data-testid="reject-suggestion"]',
	suggestionLoading: '[data-testid="suggestion-loading"]',

	// Context menu selectors
	contextMenu: '.dropdown-menu',
	deleteTaskOption: 'button:has-text("Delete task")',
	editTaskOption: 'button:has-text("Edit task")',
	priorityHigh: '[data-testid="priority-high"]',
	priorityMedium: '[data-testid="priority-medium"]',
	priorityLow: '[data-testid="priority-low"]',
	priorityBadge: '[data-testid="priority-badge"]'
} as const;
