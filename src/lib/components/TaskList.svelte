<script lang="ts">
  import type { Task } from '$lib/types';
  
  interface Props {
    tasks: Task[];
    projectId: string;
    onTaskToggle: (projectId: string, taskId: string) => void;
    onTaskDelete: (projectId: string, taskId: string) => void;
  }
  
  let { tasks, projectId, onTaskToggle, onTaskDelete }: Props = $props();
</script>

<div class="p-4 border-t">
  {#if tasks.length === 0}
    <p class="text-gray-500 text-sm italic">No tasks yet</p>
  {:else}
    <div class="space-y-2">
      {#each tasks as task}
        <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
          <input
            type="checkbox"
            checked={task.completed}
            onchange={() => onTaskToggle(projectId, task.id)}
            class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span class="flex-1 {task.completed ? 'line-through text-gray-500' : ''}">
            {task.title}
          </span>
          <span class="px-2 py-1 text-xs rounded {
            task.priority === 'high' ? 'bg-red-100 text-red-700' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }">
            {task.priority}
          </span>
          <button
            onclick={() => onTaskDelete(projectId, task.id)}
            class="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>