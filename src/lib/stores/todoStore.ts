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
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.tasks.push(task);
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
}

export function createTodoStore(initialProjects: Project[] = []): TodoStore {
  return new TodoStore(initialProjects);
}