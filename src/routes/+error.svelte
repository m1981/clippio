<script>
	import { page } from '$app/stores';
	import { dev } from '$app/environment';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
		<div class="text-center">
			<h1 class="mb-4 text-6xl font-bold text-gray-900">{$page.status}</h1>
			<h2 class="mb-4 text-xl font-semibold text-gray-700">
				{$page.status === 404 ? 'Page Not Found' : 'Something went wrong'}
			</h2>
			<p class="mb-6 text-gray-600">{$page.error?.message}</p>

			{#if dev && $page.error}
				<p class="mb-4 text-xs text-gray-400">Error: {$page.error.message}</p>
			{/if}

			<a
				href="/"
				class="inline-block rounded-md bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
			>
				Go Home
			</a>
		</div>
	</div>
</div>
