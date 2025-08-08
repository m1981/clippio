<script lang="ts">
  import type { TaskSuggestion, Task } from '$lib/types';
  
  interface Props {
    suggestion: TaskSuggestion;
    onTaskAdded: (task: Task, projectId: string) => void;
  }
  
  let { suggestion, onTaskAdded }: Props = $props();
  
  function addToSuggestedProject() {
    const newTask: Task = {
      id: Date.now().toString(),
      title: suggestion.taskTitle || '',
      completed: false,
      priority: 'medium'
    };
    
    onTaskAdded(newTask, suggestion.suggestedProject);
  }
</script>

<div class="mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md">
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span class="text-sm font-medium text-blue-800">
          AI suggests: <strong>{suggestion.suggestedProject}</strong>
        </span>
        <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
          {Math.round(suggestion.confidence * 100)}% confident
        </span>
      </div>
      <p class="text-xs text-blue-600 mb-2">{suggestion.reasoning}</p>
      
      {#if suggestion.alternatives.length > 0}
        <div class="flex gap-1 flex-wrap">
          <span class="text-xs text-gray-500">Also consider:</span>
          {#each suggestion.alternatives as alt}
            <button
              onclick={() => {
                const task: Task = {
                  id: Date.now().toString(),
                  title: suggestion.taskTitle || '',
                  completed: false,
                  priority: 'medium'
                };
                onTaskAdded(task, alt);
              }}
              class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
            >
              {alt}
            </button>
          {/each}
        </div>
      {/if}
    </div>
    
    <div class="flex gap-2 ml-3">
      <button
        onclick={addToSuggestedProject}
        class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
      >
        Add Here
      </button>
    </div>
  </div>
</div>