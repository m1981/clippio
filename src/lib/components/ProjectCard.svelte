<script lang="ts">
	import type { Project, Task } from '$lib/types';
	import TaskList from './TaskList.svelte';
	import ProjectHeader from './ProjectHeader.svelte';

	interface Props {
		project: Project;
		onTaskToggle: (projectId: string, taskId: string) => void;
		onTaskDelete: (projectId: string, taskId: string) => void;
		onTaskEdit?: (projectId: string, taskId: string) => void;
		onTaskSetPriority?: (projectId: string, taskId: string, priority: Task['priority']) => void;
	}

	let { project, onTaskToggle, onTaskDelete, onTaskEdit, onTaskSetPriority }: Props = $props();

	let isOpen = $state(project.open);

	function toggleOpen() {
		isOpen = !isOpen;
	}
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
	<ProjectHeader {project} {isOpen} onToggle={toggleOpen} />

	{#if isOpen}
		<TaskList
			tasks={project.tasks}
			projectId={project.id}
			{onTaskToggle}
			{onTaskDelete}
			{onTaskEdit}
			{onTaskSetPriority}
		/>
	{/if}
</div>
