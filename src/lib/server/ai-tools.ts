import { getChatVocabulary, updateChatVocabulary } from '$lib/server/chat.service';
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

	return { addVocabulary };
}
