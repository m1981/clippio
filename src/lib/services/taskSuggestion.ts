import type { Project, TaskSuggestion } from '$lib/types';

// Result pattern for error safety
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export interface TaskSuggestionService {
  getSuggestion(title: string, projects: Project[]): Promise<Result<TaskSuggestion>>;
}

// Type guard for API response validation
function isTaskSuggestion(obj: unknown): obj is TaskSuggestion {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as TaskSuggestion).suggestedProject === 'string' &&
    typeof (obj as TaskSuggestion).confidence === 'number' &&
    typeof (obj as TaskSuggestion).reasoning === 'string' &&
    Array.isArray((obj as TaskSuggestion).alternatives)
  );
}

export class MockTaskSuggestionService implements TaskSuggestionService {
  async getSuggestion(title: string, projects: Project[]): Promise<Result<TaskSuggestion>> {
    try {
      const lowerTitle = title.toLowerCase();
      
      if (lowerTitle.includes('work') || lowerTitle.includes('bug')) {
        return {
          success: true,
          data: {
            suggestedProject: 'Work Projects',
            confidence: 0.85,
            reasoning: 'Contains work-related keywords',
            alternatives: ['Personal'],
            taskTitle: title
          }
        };
      }
      
      // Default case
      return {
        success: true,
        data: {
          suggestedProject: 'Other',
          confidence: 0.6,
          reasoning: 'No specific keywords found',
          alternatives: ['Work Projects', 'Personal'],
          taskTitle: title
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
}

export class AnthropicTaskSuggestionService implements TaskSuggestionService {
  async getSuggestion(title: string, projects: Project[]): Promise<Result<TaskSuggestion>> {
    try {
      const response = await fetch('/api/tasks/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: title, existingProjects: projects })
      });
      
      if (!response.ok) {
        return {
          success: false,
          error: new Error(`API error: ${response.status}`)
        };
      }
      
      const data = await response.json();
      
      if (!isTaskSuggestion(data)) {
        return {
          success: false,
          error: new Error('Invalid API response format')
        };
      }
      
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Network error')
      };
    }
  }
}

// Type-safe factory with environment switching
type Environment = 'development' | 'production';

export function createTaskSuggestionService(env: Environment = 'development'): TaskSuggestionService {
  switch (env) {
    case 'development':
      return new MockTaskSuggestionService();
    case 'production':
      return new AnthropicTaskSuggestionService();
    default:
      const _exhaustive: never = env;
      throw new Error(`Unknown environment: ${_exhaustive}`);
  }
}