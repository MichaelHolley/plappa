import { OPENROUTER_API_KEY, OPENROUTER_MODEL_NAME } from '$env/static/private';
import { requireAuth } from '$lib/auth-validation.js';
import {
	getChatMessages,
	getChatVocabulary,
	updateChatMessages,
	updateChatVocabulary
} from '$lib/server/chat.service';
import type { VocabEntry } from '$lib/types';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { error } from '@sveltejs/kit';
import {
	convertToModelMessages,
	createIdGenerator,
	stepCountIs,
	streamText,
	tool,
	type UIMessage
} from 'ai';
import { z } from 'zod';
import { SystemPrompt } from './system-prompt';

const openrouter = createOpenRouter({ apiKey: OPENROUTER_API_KEY });

export async function POST({ request }) {
	const user = await requireAuth();

	const { id: chatId, message }: { id: string; message: UIMessage } = await request.json();

	const existing = await getChatMessages(chatId, user.id);

	if (!existing) error(404, 'Chat not found');

	const messages: UIMessage[] = [...existing.messages, message];

	const addVocabulary = tool({
		description:
			'Add new vocabulary words introduced in this response to the chat vocabulary list.',
		inputSchema: z.object({
			words: z.array(
				z.object({
					word: z.string(),
					translation: z.string(),
					partOfSpeech: z.string(),
					example: z.string()
				})
			)
		}),
		execute: async (input) => {
			const { words } = input;
			if (words.length === 0) return { added: [] as VocabEntry[] };

			const current = await getChatVocabulary(chatId, user.id);

			const existingWords = new Set((current?.vocabulary ?? []).map((e) => e.word.toLowerCase()));

			const newEntries: VocabEntry[] = words.filter(
				(w) => !existingWords.has(w.word.toLowerCase())
			);

			if (newEntries.length > 0) {
				await updateChatVocabulary(chatId, user.id, [
					...(current?.vocabulary ?? []),
					...newEntries
				]);
			}

			return { added: newEntries };
		}
	});

	const result = streamText({
		model: openrouter.chat(OPENROUTER_MODEL_NAME),
		system: SystemPrompt,
		messages: await convertToModelMessages(messages),
		tools: { addVocabulary },
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
