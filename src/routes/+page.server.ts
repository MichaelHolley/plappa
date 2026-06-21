import { requireAuth } from '$lib/auth-validation';
import { createChat, deleteChat, setChatArchived, updateChatTitle } from '$lib/server/chat.service';
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
	},

	renameChat: async ({ request }) => {
		const user = await requireAuth();

		const data = await request.formData();
		const id = data.get('id') as string;
		const title = (data.get('title') as string)?.trim();

		if (!id) return fail(400, { error: 'id required' });
		if (!title) return fail(400, { error: 'title required' });

		await updateChatTitle(id, user.id, title);

		return { success: true };
	},

	archiveChat: async ({ request }) => {
		const user = await requireAuth();

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { error: 'id required' });

		await setChatArchived(id, user.id, true);

		return { success: true };
	},

	unarchiveChat: async ({ request }) => {
		const user = await requireAuth();

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { error: 'id required' });

		await setChatArchived(id, user.id, false);

		return { success: true };
	}
};
