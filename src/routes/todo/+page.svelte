<script lang="ts">
  console.log('Todo page script running...');
  import TodoApp from '$lib/components/TodoApp.svelte';
</script>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Todo App</h1>
    <TodoApp />
  </div>
</div>
