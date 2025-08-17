// Request types
export interface TaskCategorizationRequest {
	taskTitle: string;
	existingProjects?: Array<{
		id: string;
		name: string;
		description?: string;
	}>;
	context?: {
		userPreferences?: string[];
		recentTasks?: string[];
		timeOfDay?: string;
		location?: string;
	};
}

// Response types
export interface TaskCategorizationResponse {
	success: boolean;
	categorization?: {
		suggestedProject: string;
		confidence: number; // 0-1 scale
		reasoning: string;
		alternativeProjects: string[];
		shouldCreateNew: boolean;
		newProjectSuggestion?: {
			name: string;
			description: string;
		};
	};
	usage?: {
		inputTokens: number;
		outputTokens: number;
	};
	error?: string;
	fallback?: string; // Fallback project name
}

// Enhanced project type
export interface ProjectWithMetadata {
	id: string;
	name: string;
	description?: string;
	keywords?: string[];
	taskCount?: number;
	lastUsed?: Date;
}
