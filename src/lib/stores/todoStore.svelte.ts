import type { Project, Task } from '$lib/types';

// Result pattern for error safety
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Interface segregation - following SOLID principles
interface ProjectReader {
  getProjects(): readonly Project[];
  getProject(projectId: string): Project | null;
}

interface TaskWriter {
  addTask(task: Task, projectId: string): Result<void>;
  toggleTask(projectId: string, taskId: string): Result<void>;
  deleteTask(projectId: string, taskId: string): Result<void>;
  setPriority(projectId: string, taskId: string, priority: Task['priority']): Result<void>;
}

// Store configuration for dependency injection
interface TodoStoreConfig {
  enableLogging?: boolean;
  maxTasksPerProject?: number;
}

export class TodoStore implements ProjectReader, TaskWriter {
  private projects: Project[] = $state([]);
  private config: TodoStoreConfig;

  constructor(initialProjects: Project[] = [], config: TodoStoreConfig = {}) {
    // Runtime validation
    if (!Array.isArray(initialProjects)) {
      throw new Error('Initial projects must be an array');
    }
    
    this.projects = initialProjects;
    this.config = {
      enableLogging: false,
      maxTasksPerProject: 100,
      ...config
    };
  }

  getProjects(): readonly Project[] {
    return this.projects;
  }

  getProject(projectId: string): Project | null {
    return this.projects.find(p => p.id === projectId) || null;
  }

  addTask(task: Task, projectId: string): Result<void> {
    const project = this.projects.find(p => p.id === projectId);
    
    if (!project) {
      return {
        success: false,
        error: new Error(`Project with ID "${projectId}" not found`)
      };
    }

    // Business rule validation
    if (project.tasks.length >= this.config.maxTasksPerProject!) {
      return {
        success: false,
        error: new Error(`Project has reached maximum tasks limit (${this.config.maxTasksPerProject})`)
      };
    }

    project.tasks.push(task);
    // Force reactivity
    this.projects = [...this.projects];
    
    if (this.config.enableLogging) {
      console.log(`Task "${task.title}" added to project "${projectId}"`);
    }
    
    return { success: true, data: undefined };
  }

  toggleTask(projectId: string, taskId: string): Result<void> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      return {
        success: false,
        error: new Error(`Project with ID "${projectId}" not found`)
      };
    }

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) {
      return {
        success: false,
        error: new Error(`Task with ID "${taskId}" not found`)
      };
    }

    task.completed = !task.completed;
    return { success: true, data: undefined };
  }

  deleteTask(projectId: string, taskId: string): Result<void> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      return {
        success: false,
        error: new Error(`Project with ID "${projectId}" not found`)
      };
    }

    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return {
        success: false,
        error: new Error(`Task with ID "${taskId}" not found`)
      };
    }

    project.tasks.splice(taskIndex, 1);
    return { success: true, data: undefined };
  }

  setPriority(projectId: string, taskId: string, priority: Task['priority']): Result<void> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      return {
        success: false,
        error: new Error(`Project with ID "${projectId}" not found`)
      };
    }

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) {
      return {
        success: false,
        error: new Error(`Task with ID "${taskId}" not found`)
      };
    }

    task.priority = priority;
    return { success: true, data: undefined };
  }
}

// Environment-based factory pattern following dependency injection
export function createTodoStore(
  initialProjects: Project[] = [], 
  config?: TodoStoreConfig
): TodoStore {
  const environment = import.meta.env.DEV ? 'development' : 'production';
  
  const defaultConfig: TodoStoreConfig = environment === 'development' 
    ? { enableLogging: true, maxTasksPerProject: 3 }
    : { enableLogging: false, maxTasksPerProject: 100 };
  
  return new TodoStore(initialProjects, { ...defaultConfig, ...config });
}