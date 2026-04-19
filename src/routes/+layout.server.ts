import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chat } from '$lib/chat-schema';
import { and, desc, eq } from 'drizzle-orm';

const PUBLIC_ROUTES = ['/login', '/signup'];

export const load = async ({ locals, url }) => {
	if (PUBLIC_ROUTES.includes(url.pathname)) {
		return { chats: [] };
	}

	if (!locals.user) throw redirect(302, '/login');

	const chats = await db
		.select({
			id: chat.id,
			title: chat.title,
			updatedAt: chat.updatedAt,
			targetLanguage: chat.targetLanguage
		})
		.from(chat)
		.where(and(eq(chat.userId, locals.user.id), eq(chat.archived, false)))
		.orderBy(desc(chat.updatedAt));

	return { chats };
};
