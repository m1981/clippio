<script lang="ts">
  import type { Project } from '$lib/types';
  import { ChevronRight } from 'lucide-svelte';
  
  interface Props {
    project: Project;
    trigger: any;
    isOpen: boolean;
  }
  
  let { project, trigger, isOpen }: Props = $props();
</script>

<button 
  use:trigger
  class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
>
  <div class="flex items-center gap-3">
    <ChevronRight 
      class="w-4 h-4 transition-transform {isOpen ? 'rotate-90' : ''}" 
    />
    <h3 class="font-medium text-gray-900">{project.name}</h3>
    <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
      {project.tasks.length} tasks
    </span>
  </div>
  
  <div class="text-sm text-gray-500">
    {project.tasks.filter(t => !t.completed).length} remaining
  </div>
</button>