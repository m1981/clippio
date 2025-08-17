
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
    console.log('🔴 TodoApp: handleTaskAdded called');
    console.log('🔴 Task:', task);
    console.log('🔴 ProjectId:', projectId);
    
    const result = todoStore.addTask(task, projectId);
    
    if (!result.success) {
      console.error('Failed to add task:', result.error.message);
      // TODO: Show user-friendly error message
      return;
    }
    
    console.log('🔴 Task added successfully');
  }
  
  function handleTaskToggle(projectId: string, taskId: string) {
    const result = todoStore.toggleTask(projectId, taskId);
    if (!result.success) {
      console.error('Failed to toggle task:', result.error.message);
    }
  }
  
  function handleTaskDelete(projectId: string, taskId: string) {
    const result = todoStore.deleteTask(projectId, taskId);
    if (!result.success) {
      console.error('Failed to delete task:', result.error.message);
    }
  }

  function handleTaskEdit(projectId: string, taskId: string) {
    // For now, just trigger edit mode - the actual editing happens in the component
    // TODO: Implement inline editing or modal
    console.log('Edit task:', projectId, taskId);
  }

  function handleTaskSetPriority(projectId: string, taskId: string, priority: Task['priority']) {
    const result = todoStore.setPriority(projectId, taskId, priority);
    if (!result.success) {
      console.error('Failed to set priority:', result.error.message);
    }
  }

  // Convert readonly to mutable for component props
  const projects = $derived([...todoStore.getProjects()]);
</script>

<div class="max-w-2xl mx-auto p-6 space-y-4">
  <h1 class="text-2xl font-bold text-gray-900">Todo Projects</h1>
  
  <TaskInput 
    projects={projects} 
    onTaskAdded={handleTaskAdded} 
  />
  
  <ProjectList 
    projects={projects}
    onTaskToggle={handleTaskToggle}
    onTaskDelete={handleTaskDelete}
    onTaskEdit={handleTaskEdit}
    onTaskSetPriority={handleTaskSetPriority}
  />
</div>