import type { Chat } from './chat-schema';

export type ChatSummary = Pick<Chat, 'id' | 'title' | 'updatedAt' | 'targetLanguage'>;

export type VocabEntry = {
	word: string;
	translation: string;
	partOfSpeech: string;
	example: string;
};
