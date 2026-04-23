import { OPENROUTER_API_KEY, OPENROUTER_MODEL_NAME } from '$env/static/private';
import { requireAuth } from '$lib/auth-validation.js';
import { chat } from '$lib/chat-schema';
import { db } from '$lib/server/db';
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
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { SystemPrompt } from './system-prompt';

const openrouter = createOpenRouter({ apiKey: OPENROUTER_API_KEY });

export async function POST({ request }) {
	const user = await requireAuth();

	const { id: chatId, message }: { id: string; message: UIMessage } = await request.json();

	const [existing] = await db
		.select({ messages: chat.messages, vocabulary: chat.vocabulary })
		.from(chat)
		.where(and(eq(chat.id, chatId), eq(chat.userId, user.id)));

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

			const [current] = await db
				.select({ vocabulary: chat.vocabulary })
				.from(chat)
				.where(and(eq(chat.id, chatId), eq(chat.userId, user.id)));

			const existingWords = new Set((current?.vocabulary ?? []).map((e) => e.word.toLowerCase()));

			const newEntries: VocabEntry[] = words.filter(
				(w) => !existingWords.has(w.word.toLowerCase())
			);

			if (newEntries.length > 0) {
				await db
					.update(chat)
					.set({ vocabulary: [...(current?.vocabulary ?? []), ...newEntries] })
					.where(and(eq(chat.id, chatId), eq(chat.userId, user.id)));
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
			await db
				.update(chat)
				.set({ messages: [...messages], updatedAt: new Date() })
				.where(and(eq(chat.id, chatId), eq(chat.userId, user.id)));
		}
	});
}
