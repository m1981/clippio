<script lang="ts">
	import type { Task } from '$lib/types';

	interface Props {
		task: Task;
		projectId: string;
		onTaskToggle: (projectId: string, taskId: string) => void;
	}

	let { task, projectId, onTaskToggle }: Props = $props();
</script>

<li data-testid="task-item" role="listitem">
	<input
		type="checkbox"
		data-testid="task-checkbox"
		checked={task.completed}
		onchange={() => onTaskToggle(projectId, task.id)}
		class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
	/>
	<!-- existing task content -->
</li>
