import { requireAuth } from '$lib/auth-validation.js';
import { getChatById } from '$lib/server/chat.service';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const user = await requireAuth();

	const result = await getChatById(params.id, user.id);

	if (!result) error(404, 'Chat not found');

	return { chat: result };
};
