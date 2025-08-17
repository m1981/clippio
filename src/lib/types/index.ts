export interface Task {
	id: string;
	title: string;
	completed: boolean;
	priority: 'low' | 'medium' | 'high';
	dueDate?: string;
}

export interface Project {
	id: string;
	name: string;
	tasks: Task[];
	open: boolean;
}

export interface TaskSuggestion {
	suggestedProject: string;
	confidence: number;
	reasoning: string;
	alternatives: string[];
	taskTitle?: string;
}

export interface TaskInputEvents {
	onTaskAdded: (task: Task, projectId: string) => void;
}

export interface ProjectEvents {
	onTaskToggle: (projectId: string, taskId: string) => void;
	onTaskDelete: (projectId: string, taskId: string) => void;
}
