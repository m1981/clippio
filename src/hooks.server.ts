import type { Handle, HandleServerError } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Skip auth for DevTools requests
	if (event.url.pathname.includes('.well-known')) {
		return new Response('Not Found', { status: 404 });
	}

	try {
		const sessionToken = event.cookies.get(auth.sessionCookieName);

		if (!sessionToken) {
			event.locals.user = null;
			event.locals.session = null;
			return resolve(event);
		}

		const { session, user } = await auth.validateSessionToken(sessionToken);

		if (session) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} else {
			auth.deleteSessionTokenCookie(event);
		}

		event.locals.user = user;
		event.locals.session = session;
		return resolve(event);
	} catch (error) {
		console.error('Auth error:', error);
		// Continue without auth on error
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}
};

export const handle: Handle = handleAuth;

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	// Don't log DevTools 404s
	if (event.url.pathname.includes('.well-known')) {
		return { message: 'Not Found' };
	}

	console.error('Server error:', {
		error,
		url: event.url.pathname,
		status,
		message,
		stack: error instanceof Error ? error.stack : undefined
	});

	return {
		message: 'Something went wrong',
		errorId: crypto.randomUUID()
	};
};
