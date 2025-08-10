import type { Handle, HandleServerError } from '@sveltejs/kit';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Skip auth for DevTools requests
	if (event.url.pathname.includes('.well-known')) {
		return new Response('Not Found', { status: 404 });
	}

}
