import { requireAuth } from '$lib/auth-validation.js';
import { chat } from '$lib/chat-schema';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const load = async ({ params }) => {
	const user = await requireAuth();

	const [result] = await db
		.select()
		.from(chat)
		.where(and(eq(chat.id, params.id), eq(chat.userId, user.id)));

	if (!result) error(404, 'Chat not found');

	return { chat: result };
};
