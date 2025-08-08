
<script lang="ts">
  import TaskInput from './TaskInput.svelte';
  import ProjectList from './ProjectList.svelte';
  import { createTodoStore } from '$lib/stores/todoStore.svelte';
  import type { Task } from '$lib/types';
  
  // Initialize store with demo data
  const todoStore = createTodoStore([
    {
      id: '1',
      name: 'Work Projects',
      open: true,
      tasks: [
        { id: '1', title: 'Review pull requests', completed: false, priority: 'high' },
        { id: '2', title: 'Update documentation', completed: true, priority: 'medium' }
      ]
    },
    {
      id: '2',
      name: 'Personal',
      open: false,
      tasks: [
        { id: '5', title: 'Buy groceries', completed: false, priority: 'medium' }
      ]
    }
  ]);
  
  function handleTaskAdded(task: Task, projectId: string) {
    todoStore.addTask(task, projectId);
  }
  
  function handleTaskToggle(projectId: string, taskId: string) {
    todoStore.toggleTask(projectId, taskId);
  }
  
  function handleTaskDelete(projectId: string, taskId: string) {
    todoStore.deleteTask(projectId, taskId);
  }
</script>

<div class="max-w-2xl mx-auto p-6 space-y-4">
  <h1 class="text-2xl font-bold text-gray-900">Todo Projects</h1>
  
  <TaskInput 
    projects={todoStore.getProjects()} 
    onTaskAdded={handleTaskAdded} 
  />
  
  <ProjectList 
    projects={todoStore.getProjects()}
    onTaskToggle={handleTaskToggle}
    onTaskDelete={handleTaskDelete}
  />
</div>