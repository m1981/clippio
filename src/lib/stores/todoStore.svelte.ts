import type { Project, Task } from '$lib/types';

export class TodoStore {
  private projects: Project[] = $state([]);

  constructor(initialProjects: Project[] = []) {
    this.projects = initialProjects;
  }

  getProjects(): Project[] {
    return this.projects;
  }

  addTask(task: Task, projectId: string) {
    console.log('🟠 Store: addTask called');
    console.log('🟠 Looking for project with ID/name:', projectId);
    console.log('🟠 Available projects:', this.projects.map(p => ({ id: p.id, name: p.name })));
    
    // Try to find by name first (since we're passing project name, not ID)
    let project = this.projects.find(p => p.name === projectId);
    
    if (!project) {
      // Fallback to ID search
      project = this.projects.find(p => p.id === projectId);
    }
    
    if (project) {
      console.log('🟠 Found project:', project.name);
      console.log('🟠 Current tasks:', project.tasks.length);
      project.tasks.push(task);
      console.log('🟠 Tasks after adding:', project.tasks.length);
      
      // Force reactivity by creating new array reference
      this.projects = [...this.projects];
    } else {
      console.error('🟠 Project not found!');
    }
  }

  toggleTask(projectId: string, taskId: string) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      const task = project.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
      }
    }
  }

  deleteTask(projectId: string, taskId: string) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.tasks = project.tasks.filter(t => t.id !== taskId);
    }
  }

  editTask(projectId: string, taskId: string) {
    console.log('✏️ editTask called:', { projectId, taskId });
    // TODO: Implement task editing functionality
  }

  setPriority(projectId: string, taskId: string, priority: Task['priority']) {
    console.log('🎯 setPriority called:', { projectId, taskId, priority });
    const project = this.projects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    if (task) {
      const oldPriority = task.priority;
      task.priority = priority;
      console.log('🎯 Priority changed:', { taskId, from: oldPriority, to: priority });
    }
  }
}

export function createTodoStore(initialProjects: Project[] = []): TodoStore {
  return new TodoStore(initialProjects);
}