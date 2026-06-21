import { redirect } from '@sveltejs/kit';
import { getArchivedChats, getUserChats } from '$lib/server/chat.service';

const PUBLIC_ROUTES = ['/login', '/signup'];

export const load = async ({ locals, url }) => {
	if (PUBLIC_ROUTES.includes(url.pathname)) {
		return { chats: [], archivedChats: [] };
	}

	if (!locals.user) throw redirect(302, '/login');

	const [chats, archivedChats] = await Promise.all([
		getUserChats(locals.user.id),
		getArchivedChats(locals.user.id)
	]);

	return { chats, archivedChats };
};
