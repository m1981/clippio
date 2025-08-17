<script lang="ts">
	import type { Project, Task, TaskSuggestion } from '$lib/types';
	import TaskSuggestionComponent from './TaskSuggestion.svelte';
	import { createTaskSuggestionService } from '$lib/services/taskSuggestion';

	interface Props {
		projects: Project[];
		onTaskAdded: (task: Task, projectId: string) => void;
	}

	let { projects, onTaskAdded }: Props = $props();

	let newTaskTitle = $state('');
	let suggestion = $state<TaskSuggestion | null>(null);

	const taskSuggestionService = createTaskSuggestionService();

	async function handleInput() {
		if (newTaskTitle.trim().length > 3) {
			const result = await taskSuggestionService.getSuggestion(newTaskTitle, projects);
			if (result.success) {
				suggestion = result.data;
			} else {
				console.error('Failed to get suggestion:', result.error);
				suggestion = null;
			}
		} else {
			suggestion = null;
		}
	}

	function handleTaskAdded(task: Task, projectId: string) {
		console.log('🟢 TaskInput: handleTaskAdded called');
		console.log('🟢 Task:', task);
		console.log('🟢 ProjectId:', projectId);
		console.log(
			'🟢 Available projects:',
			projects.map((p) => `${p.name} (ID: ${p.id})`)
		);

		// Debug the actual project structure
		console.log('🟢 Full projects array:', projects);

		// Convert project name to ID if needed
		const project = projects.find((p) => p.name === projectId || p.id === projectId);

		if (!project) {
			console.error('🟢 Project not found:', projectId);
			console.error('🟢 Available projects:', projects);
			return;
		}

		const actualProjectId = project.id;
		console.log('🟢 Resolved project ID:', actualProjectId);

		onTaskAdded(task, actualProjectId);

		newTaskTitle = '';
		suggestion = null;
	}
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4">
	<input
		bind:value={newTaskTitle}
		oninput={handleInput}
		placeholder="Add a new task... (try 'fix work bug' or 'pick up kids')"
		class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
		data-testid="task-input"
	/>

	{#if suggestion}
		<TaskSuggestionComponent {suggestion} onTaskAdded={handleTaskAdded} />
	{/if}
</div>
