import { requireAuth } from '$lib/auth-validation';
import { createChat, deleteChat } from '$lib/server/chat.service';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	createChat: async ({ request }) => {
		const user = await requireAuth();

		const data = await request.formData();
		const targetLanguage = data.get('targetLanguage') as string;

		if (!targetLanguage) return fail(400, { error: 'targetLanguage required' });

		const newChat = await createChat(user.id, targetLanguage);

		throw redirect(302, `/chat/${newChat.id}`);
	},

	deleteChat: async ({ request }) => {
		const user = await requireAuth();

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { error: 'id required' });

		await deleteChat(id, user.id);

		return { success: true };
	}
};
