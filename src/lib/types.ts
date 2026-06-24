import type { Chat } from './chat-schema';
import { z } from 'zod';

export const LanguageSchema = z.object({
	value: z.string(),
	label: z.string(),
	flag: z.string()
});

export type Language = z.infer<typeof LanguageSchema>;

export type ChatSummary = Pick<Chat, 'id' | 'title' | 'updatedAt' | 'targetLanguage'>;

export const VocabEntrySchema = z.object({
	word: z.string().describe('The vocabulary word in the target language'),
	translation: z.string().describe("Translation of the word in the user's native language"),
	partOfSpeech: z.string().describe('Grammatical category, e.g. noun, verb, adjective'),
	example: z.string().describe('Example sentence using the word in the target language')
});

export type VocabEntry = z.infer<typeof VocabEntrySchema>;

export const CorrectionSchema = z.object({
	original: z.string().describe("The user's original, incorrect phrase or word"),
	corrected: z.string().describe('The corrected phrase or word in the target language'),
	explanation: z.string().describe('A brief explanation of why the correction was needed'),
	severity: z
		.enum(['minor', 'major'])
		.optional()
		.describe('How significant the mistake is — minor for small slips, major for key errors')
});

export type Correction = z.infer<typeof CorrectionSchema>;
