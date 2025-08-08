import type { Project, TaskSuggestion } from '$lib/types';

export interface TaskSuggestionService {
  getSuggestion(title: string, projects: Project[]): Promise<TaskSuggestion>;
}

export class MockTaskSuggestionService implements TaskSuggestionService {
  async getSuggestion(title: string, projects: Project[]): Promise<TaskSuggestion> {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('work') || lowerTitle.includes('bug')) {
      return {
        suggestedProject: 'Work Projects',
        confidence: 0.85,
        reasoning: 'Contains work-related keywords',
        alternatives: ['Personal']
      };
    }
    
    // ... other logic
  }
}

export class AnthropicTaskSuggestionService implements TaskSuggestionService {
  async getSuggestion(title: string, projects: Project[]): Promise<TaskSuggestion> {
    const response = await fetch('/api/tasks/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskTitle: title, existingProjects: projects })
    });
    
    return response.json();
  }
}

// Factory pattern for easy switching
export function createTaskSuggestion(title: string, projects: Project[]) {
  const service = new MockTaskSuggestionService(); // Switch to Anthropic later
  return service.getSuggestion(title, projects);
}