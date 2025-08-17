import type { Handle, HandleServerError } from '@sveltejs/kit';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Skip auth for DevTools requests
	if (event.url.pathname.includes('.well-known')) {
		return new Response('Not Found', { status: 404 });
	}

	// TODO: Implement auth when $lib/server/auth is ready
	// For now, set locals to null (no authentication)
	event.locals.user = null;
	event.locals.session = null;
	
	return resolve(event);
};

export const handle: Handle = handleAuth;

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	console.error('Server error:', error);
	
	return {
		message: import.meta.env.DEV ? message : 'Internal server error'
	};
};