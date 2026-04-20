import { OPENROUTER_API_KEY, OPENROUTER_MODEL_NAME } from '$env/static/private';
import { requireAuth } from '$lib/auth-validation.js';
import { chat } from '$lib/chat-schema';
import { db } from '$lib/server/db';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { error } from '@sveltejs/kit';
import { convertToModelMessages, createIdGenerator, streamText, type UIMessage } from 'ai';
import { and, eq } from 'drizzle-orm';
import { SystemPrompt } from './system-prompt';

const openrouter = createOpenRouter({ apiKey: OPENROUTER_API_KEY });

export async function POST({ request }) {
	const user = await requireAuth();

	const { id: chatId, message }: { id: string; message: UIMessage } = await request.json();

	const [existing] = await db
		.select({ messages: chat.messages })
		.from(chat)
		.where(and(eq(chat.id, chatId), eq(chat.userId, user.id)));

	if (!existing) error(404, 'Chat not found');

	const messages: UIMessage[] = [...existing.messages, message];

	const result = streamText({
		model: openrouter.chat(OPENROUTER_MODEL_NAME),
		system: SystemPrompt,
		messages: await convertToModelMessages(messages)
	});

	result.consumeStream();

	return result.toUIMessageStreamResponse({
		originalMessages: messages,
		generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
		async onFinish({ messages }) {
			await db
				.update(chat)
				.set({ messages: [...messages], updatedAt: new Date() })
				.where(and(eq(chat.id, chatId), eq(chat.userId, user.id)));
		}
	});
}
