<script lang="ts">
	import type { Project } from '$lib/types';

	interface Props {
		project: Project;
		isOpen: boolean;
		onToggle: () => void;
	}

	let { project, isOpen, onToggle }: Props = $props();

	// Generate slug from project name
	let testId = $derived.by(() => {
		const slug = project.name.toLowerCase().replace(/\s+/g, '-');
		return `project-header-${slug}`;
	});
</script>

<button
	onclick={onToggle}
	class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
	aria-expanded={isOpen}
	aria-label="Toggle {project.name} project"
	data-testid={testId}
>
	<div class="flex items-center gap-3">
		<span class="h-4 w-4 transition-transform {isOpen ? 'rotate-90' : ''} text-gray-500"> ▶ </span>
		<h3 class="font-medium text-gray-900">{project.name}</h3>
		<span class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
			{project.tasks.length} tasks
		</span>
	</div>

	<div class="text-sm text-gray-500">
		{project.tasks.filter((t) => !t.completed).length} remaining
	</div>
</button>
