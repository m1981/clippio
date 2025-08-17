<script lang="ts">
	import { MoreVertical, Edit, Trash2, Check, Clock } from 'lucide-svelte';
	import type { Task } from '$lib/types';

	interface Props {
		tasks: Task[];
		projectId: string;
		onTaskToggle: (projectId: string, taskId: string) => void;
		onTaskDelete: (projectId: string, taskId: string) => void;
		onTaskEdit?: (projectId: string, taskId: string) => void;
		onTaskSetPriority?: (projectId: string, taskId: string, priority: Task['priority']) => void;
	}

	let { tasks, projectId, onTaskToggle, onTaskDelete, onTaskEdit, onTaskSetPriority }: Props =
		$props();

	// Context menu state
	let openDropdown = $state<string | null>(null);
	let mouseX = $state(0);
	let mouseY = $state(0);

	function toggleDropdown(taskId: string, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		mouseX = event.clientX;
		mouseY = event.clientY;

		const wasOpen = openDropdown === taskId;
		openDropdown = wasOpen ? null : taskId;
	}

	function handleTaskRightClick(taskId: string, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		mouseX = event.clientX;
		mouseY = event.clientY;
		openDropdown = taskId;
	}

	function handleTaskKeydown(taskId: string, event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			const rect = (event.target as HTMLElement).getBoundingClientRect();
			mouseX = rect.right;
			mouseY = rect.top;
			openDropdown = taskId;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (openDropdown) {
			const isDropdownClick = (event.target as Element)?.closest('.dropdown-menu');
			if (!isDropdownClick) {
				openDropdown = null;
			}
		}
	}

	function handleMenuKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			openDropdown = null;
		}
	}

	function editTask(taskId: string) {
		onTaskEdit?.(projectId, taskId);
		openDropdown = null;
	}

	function setPriority(taskId: string, priority: Task['priority']) {
		onTaskSetPriority?.(projectId, taskId, priority);
		openDropdown = null;
	}

	function deleteTask(taskId: string) {
		onTaskDelete(projectId, taskId);
		openDropdown = null;
	}
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleMenuKeydown} />

<ul class="divide-y divide-gray-100 border-t border-gray-200" role="list">
	{#if tasks.length === 0}
		<li class="p-4 text-center text-sm text-gray-500">No tasks yet. Add one above!</li>
	{:else}
		{#each tasks as task (task.id)}
			<div
				class="group relative flex items-center gap-3 p-4 hover:bg-gray-50"
				role="button"
				tabindex="0"
				oncontextmenu={(e) => handleTaskRightClick(task.id, e)}
				onkeydown={(e) => handleTaskKeydown(task.id, e)}
				aria-label="Task: {task.title}"
			>
				<input
					type="checkbox"
					checked={task.completed}
					onchange={() => onTaskToggle(projectId, task.id)}
					class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
					aria-label="Mark task {task.completed ? 'incomplete' : 'complete'}"
				/>

				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<span
							data-testid="task-title"
							class="text-sm font-medium {task.completed
								? 'text-gray-500 line-through'
								: 'text-gray-900'}"
						>
							{task.title}
						</span>
						<span
							class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                         {task.priority === 'high'
								? 'bg-red-100 text-red-800'
								: task.priority === 'medium'
									? 'bg-yellow-100 text-yellow-800'
									: 'bg-gray-100 text-gray-800'}"
							aria-label="Priority: {task.priority}"
						>
							{task.priority}
						</span>
					</div>
				</div>

				<button
					onclick={(e) => toggleDropdown(task.id, e)}
					class="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-200"
					aria-label="Open task menu for {task.title}"
					aria-expanded={openDropdown === task.id}
				>
					<MoreVertical class="h-4 w-4 text-gray-500" />
				</button>
			</div>
		{/each}
	{/if}
</ul>

<!-- Context Menu (positioned absolutely) -->
{#each tasks as task (task.id)}
	{#if openDropdown === task.id}
		<div
			class="dropdown-menu fixed z-50 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
			style="top: {Math.min(window.innerHeight - 300, mouseY)}px; left: {Math.min(
				window.innerWidth - 180,
				mouseX
			)}px;"
			role="menu"
			aria-label="Task actions for {task.title}"
			tabindex="-1"
		>
			<button
				onclick={() => editTask(task.id)}
				class="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
				role="menuitem"
				aria-label="Edit task"
			>
				<Edit class="h-4 w-4" />
				Edit task
			</button>

			<button
				onclick={() => onTaskToggle(projectId, task.id)}
				class="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
				role="menuitem"
				aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
			>
				{#if task.completed}
					<Clock class="h-4 w-4" />
					Mark incomplete
				{:else}
					<Check class="h-4 w-4" />
					Mark complete
				{/if}
			</button>

			<div class="my-1 border-t border-gray-100" role="separator"></div>

			<div
				class="px-3 py-1 text-xs font-medium tracking-wide text-gray-500 uppercase"
				role="presentation"
			>
				Priority
			</div>

			{#each ['high', 'medium', 'low'] as priority (priority)}
				<button
					onclick={() => setPriority(task.id, priority as Task['priority'])}
					class="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100
                 {task.priority === priority ? 'bg-blue-50 text-blue-700' : ''}"
					role="menuitem"
					aria-label="Set priority to {priority}"
					aria-current={task.priority === priority ? 'true' : undefined}
				>
					<div
						class="h-2 w-2 rounded-full
                    {priority === 'high'
							? 'bg-red-500'
							: priority === 'medium'
								? 'bg-yellow-500'
								: 'bg-gray-400'}"
					></div>
					{priority.charAt(0).toUpperCase() + priority.slice(1)}
				</button>
			{/each}

			<div class="my-1 border-t border-gray-100" role="separator"></div>

			<button
				onclick={() => deleteTask(task.id)}
				class="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
				role="menuitem"
				aria-label="Delete task"
			>
				<Trash2 class="h-4 w-4" />
				Delete task
			</button>
		</div>
	{/if}
{/each}
