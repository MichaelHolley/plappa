import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';

export async function requireAuth() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		error(401, 'User is not authenticated');
	}

	return locals.user;
}
