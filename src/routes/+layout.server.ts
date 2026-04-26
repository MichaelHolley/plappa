import { redirect } from '@sveltejs/kit';
import { getUserChats } from '$lib/server/chat.service';

const PUBLIC_ROUTES = ['/login', '/signup'];

export const load = async ({ locals, url }) => {
	if (PUBLIC_ROUTES.includes(url.pathname)) {
		return { chats: [] };
	}

	if (!locals.user) throw redirect(302, '/login');

	const chats = await getUserChats(locals.user.id);

	return { chats };
};
