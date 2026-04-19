import { requireAuth } from '$lib/auth-validation';
import { chat } from '$lib/chat-schema';
import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const actions = {
	createChat: async ({ request }) => {
		const user = await requireAuth();

		const data = await request.formData();
		const targetLanguage = data.get('targetLanguage') as string;

		if (!targetLanguage) return fail(400, { error: 'targetLanguage required' });

		const [newChat] = await db
			.insert(chat)
			.values({ userId: user.id, targetLanguage })
			.returning({ id: chat.id });

		throw redirect(302, `/chat/${newChat.id}`);
	},

	deleteChat: async ({ request }) => {
		const user = await requireAuth();

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { error: 'id required' });

		await db.delete(chat).where(and(eq(chat.id, id), eq(chat.userId, user.id)));

		return { success: true };
	}
};
