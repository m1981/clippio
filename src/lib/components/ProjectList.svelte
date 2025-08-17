<script lang="ts">
	import type { Project, Task } from '$lib/types';
	import ProjectCard from './ProjectCard.svelte';

	interface Props {
		projects: Project[];
		onTaskToggle: (projectId: string, taskId: string) => void;
		onTaskDelete: (projectId: string, taskId: string) => void;
		onTaskEdit?: (projectId: string, taskId: string) => void;
		onTaskSetPriority?: (projectId: string, taskId: string, priority: Task['priority']) => void;
	}

	let { projects, onTaskToggle, onTaskDelete, onTaskEdit, onTaskSetPriority }: Props = $props();
</script>

<div class="space-y-4">
	{#each projects as project (project.id)}
		<ProjectCard {project} {onTaskToggle} {onTaskDelete} {onTaskEdit} {onTaskSetPriority} />
	{/each}
</div>
