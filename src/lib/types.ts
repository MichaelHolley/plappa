import type { Chat } from './chat-schema';

export type ChatSummary = Pick<Chat, 'id' | 'title' | 'updatedAt' | 'targetLanguage'>;
