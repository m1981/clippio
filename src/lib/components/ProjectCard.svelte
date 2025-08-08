<script lang="ts">
  import type { Project } from '$lib/types';
  import TaskList from './TaskList.svelte';
  import ProjectHeader from './ProjectHeader.svelte';
  
  interface Props {
    project: Project;
    onTaskToggle: (projectId: string, taskId: string) => void;
    onTaskDelete: (projectId: string, taskId: string) => void;
  }
  
  let { project, onTaskToggle, onTaskDelete }: Props = $props();
  
  // Simple state management without Melt UI for now
  let isOpen = $state(project.open);
  
  function toggleOpen() {
    isOpen = !isOpen;
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg shadow-sm">
  <button 
    onclick={toggleOpen}
    class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
  >
    <div class="flex items-center gap-3">
      <span class="w-4 h-4 transition-transform {isOpen ? 'rotate-90' : ''} text-gray-500">
        ▶
      </span>
      <h3 class="font-medium text-gray-900">{project.name}</h3>
      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
        {project.tasks.length} tasks
      </span>
    </div>
    
    <div class="text-sm text-gray-500">
      {project.tasks.filter(t => !t.completed).length} remaining
    </div>
  </button>
  
  {#if isOpen}
    <TaskList 
      tasks={project.tasks}
      projectId={project.id}
      {onTaskToggle}
      {onTaskDelete}
    />
  {/if}
</div>