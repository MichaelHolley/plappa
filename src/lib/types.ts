import type { Chat } from './chat-schema';
import { z } from 'zod';

export type ChatSummary = Pick<Chat, 'id' | 'title' | 'updatedAt' | 'targetLanguage'>;

export const VocabEntrySchema = z.object({
	word: z.string().describe('The vocabulary word in the target language'),
	translation: z.string().describe("Translation of the word in the user's native language"),
	partOfSpeech: z.string().describe('Grammatical category, e.g. noun, verb, adjective'),
	example: z.string().describe('Example sentence using the word in the target language')
});

export type VocabEntry = z.infer<typeof VocabEntrySchema>;
