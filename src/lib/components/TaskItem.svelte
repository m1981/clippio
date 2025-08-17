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
    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
  />
  <!-- existing task content -->
</li>