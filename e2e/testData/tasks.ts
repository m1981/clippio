export interface TestTask {
	title: string;
	priority: 'high' | 'medium' | 'low';
	project: 'work' | 'personal';
	completed?: boolean;
}

export const testTasks = {
	work: {
		highPriority: {
			title: 'Fix authentication bug',
			priority: 'high' as const,
			project: 'work' as const
		},
		mediumPriority: {
			title: 'Update documentation',
			priority: 'medium' as const,
			project: 'work' as const
		},
		lowPriority: {
			title: 'Organize team meeting',
			priority: 'low' as const,
			project: 'work' as const
		}
	},
	personal: {
		shopping: {
			title: 'Buy groceries',
			priority: 'medium' as const,
			project: 'personal' as const
		},
		exercise: {
			title: 'Go for a run',
			priority: 'low' as const,
			project: 'personal' as const
		},
		urgent: {
			title: 'Pay electricity bill',
			priority: 'high' as const,
			project: 'personal' as const
		}
	}
} as const;

export const aiSuggestionTasks = {
	workRelated: [
		'Review pull requests',
		'Deploy to production',
		'Write unit tests',
		'Refactor legacy code'
	],
	personalRelated: ['Book dentist appointment', 'Plan weekend trip', 'Call mom', 'Clean the house'],
	newProjectSuggestions: [
		'Plan vacation to Japan',
		'Learn Spanish',
		'Start fitness routine',
		'Renovate kitchen'
	]
} as const;
