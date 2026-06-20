import { getChatVocabulary, updateChatTitle, updateChatVocabulary } from '$lib/server/chat.service';
import { VocabEntrySchema, type VocabEntry } from '$lib/types';
import { tool } from 'ai';
import { z } from 'zod';

export function createChatTools(chatId: string, userId: string) {
	const addVocabulary = tool({
		description:
			'Add new vocabulary words introduced in this response to the chat vocabulary list.',
		inputSchema: z.object({
			words: z.array(VocabEntrySchema).describe('List of new vocabulary words to add')
		}),
		execute: async (input) => {
			const { words } = input;
			if (words.length === 0) return { added: [] as VocabEntry[] };

			const current = await getChatVocabulary(chatId, userId);

			const existingWords = new Set((current?.vocabulary ?? []).map((e) => e.word.toLowerCase()));

			const newEntries: VocabEntry[] = words.filter(
				(w) => !existingWords.has(w.word.toLowerCase())
			);

			if (newEntries.length > 0) {
				await updateChatVocabulary(chatId, userId, [...(current?.vocabulary ?? []), ...newEntries]);
			}

			return { added: newEntries };
		}
	});

	const updateTitle = tool({
		description:
			'Set a short, descriptive title for this chat session based on its topic. Call this once early in the conversation, after the first two or three user messages, when the subject of the conversation has become clear.',
		inputSchema: z.object({
			title: z
				.string()
				.describe('A concise title (max ~5 words) summarizing the topic of the conversation')
		}),
		execute: async (input) => {
			await updateChatTitle(chatId, userId, input.title);
			return { title: input.title };
		}
	});

	return { addVocabulary, updateChatTitle: updateTitle };
}
