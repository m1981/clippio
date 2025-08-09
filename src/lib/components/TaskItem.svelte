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