<script>
    import { page } from '$app/stores';
    import { dev } from '$app/environment';
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-gray-900 mb-4">{$page.status}</h1>
            <h2 class="text-xl font-semibold text-gray-700 mb-4">
                {$page.status === 404 ? 'Page Not Found' : 'Something went wrong'}
            </h2>
            <p class="text-gray-600 mb-6">{$page.error?.message}</p>
            
            {#if dev && $page.error?.errorId}
                <p class="text-xs text-gray-400 mb-4">Error ID: {$page.error.errorId}</p>
            {/if}
            
            <a 
                href="/" 
                class="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
                Go Home
            </a>
        </div>
    </div>
</div>