<script lang="ts">
	import type { TaskSuggestion, Task } from '$lib/types';

	interface Props {
		suggestion: TaskSuggestion;
		onTaskAdded: (task: Task, projectId: string) => void;
	}

	let { suggestion, onTaskAdded }: Props = $props();

	function addToSuggestedProject() {
		console.log('🔵 TaskSuggestion: addToSuggestedProject called');
		console.log('🔵 Suggestion:', suggestion);

		const newTask: Task = {
			id: Date.now().toString(),
			title: suggestion.taskTitle || '',
			completed: false,
			priority: 'medium'
		};

		console.log('🔵 Created task:', newTask);
		console.log('🔵 Target project:', suggestion.suggestedProject);

		onTaskAdded(newTask, suggestion.suggestedProject);
		console.log('🔵 onTaskAdded called');
	}
</script>

<div class="mt-2 rounded-md border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3">
	<div class="flex items-start justify-between">
		<div class="flex-1">
			<div class="mb-1 flex items-center gap-2">
				<div class="h-2 w-2 rounded-full bg-blue-500"></div>
				<span class="text-sm font-medium text-blue-800">
					AI suggests: <strong>{suggestion.suggestedProject}</strong>
				</span>
				<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
					{Math.round(suggestion.confidence * 100)}% confident
				</span>
			</div>
			<p class="mb-2 text-xs text-blue-600">{suggestion.reasoning}</p>

			{#if suggestion.alternatives.length > 0}
				<div class="flex flex-wrap gap-1">
					<span class="text-xs text-gray-500">Also consider:</span>
					{#each suggestion.alternatives as alt (alt)}
						<button
							onclick={() => {
								console.log('🟡 Alternative button clicked:', alt);
								const task: Task = {
									id: Date.now().toString(),
									title: suggestion.taskTitle || '',
									completed: false,
									priority: 'medium'
								};
								onTaskAdded(task, alt);
							}}
							class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
						>
							{alt}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="ml-3 flex gap-2">
			<button
				onclick={addToSuggestedProject}
				class="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
				data-testid="add-here-button"
			>
				Add Here
			</button>
		</div>
	</div>
</div>
