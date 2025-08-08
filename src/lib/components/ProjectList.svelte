<script lang="ts">
  import type { Project } from '$lib/types';
  import ProjectCard from './ProjectCard.svelte';
  
  interface Props {
    projects: Project[];
    onTaskToggle: (projectId: string, taskId: string) => void;
    onTaskDelete: (projectId: string, taskId: string) => void;
  }
  
  let { projects, onTaskToggle, onTaskDelete }: Props = $props();
</script>

<div class="space-y-4">
  {#each projects as project}
    <ProjectCard 
      {project} 
      {onTaskToggle} 
      {onTaskDelete} 
    />
  {/each}
</div>