<script lang="ts">
	console.log('Todo page script running...');
	import TodoApp from '$lib/components/TodoApp.svelte';
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-2xl">
		<h1 class="mb-8 text-3xl font-bold text-gray-900">Todo App</h1>
		<TodoApp />
	</div>
</div>
