import { OPENROUTER_API_KEY, OPENROUTER_MODEL_NAME } from '$env/static/private';
import { requireAuth } from '$lib/auth-validation.js';
import { createChatTools } from '$lib/server/ai-tools';
import { getChatMessages, updateChatMessages } from '$lib/server/chat.service';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { error } from '@sveltejs/kit';
import {
	convertToModelMessages,
	createIdGenerator,
	stepCountIs,
	streamText,
	type UIMessage
} from 'ai';
import { SystemPrompt } from './system-prompt';

const openrouter = createOpenRouter({ apiKey: OPENROUTER_API_KEY });

export async function POST({ request }) {
	const user = await requireAuth();

	const { id: chatId, message }: { id: string; message: UIMessage } = await request.json();

	const existing = await getChatMessages(chatId, user.id);

	if (!existing) error(404, 'Chat not found');

	const messages: UIMessage[] = [...existing.messages, message];

	const tools = createChatTools(chatId, user.id);

	const result = streamText({
		model: openrouter.chat(OPENROUTER_MODEL_NAME),
		system: SystemPrompt,
		messages: await convertToModelMessages(messages),
		tools,
		stopWhen: stepCountIs(2)
	});

	result.consumeStream();

	return result.toUIMessageStreamResponse({
		originalMessages: messages,
		generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
		async onFinish({ messages }) {
			await updateChatMessages(chatId, user.id, messages);
		}
	});
}
