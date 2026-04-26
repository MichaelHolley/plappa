import type { UIMessage } from 'ai';
import { and, desc, eq } from 'drizzle-orm';
import { chat } from '$lib/chat-schema';
import type { VocabEntry } from '$lib/types';
import { db } from './db';

export async function getUserChats(userId: string) {
	return db
		.select({
			id: chat.id,
			title: chat.title,
			updatedAt: chat.updatedAt,
			targetLanguage: chat.targetLanguage
		})
		.from(chat)
		.where(and(eq(chat.userId, userId), eq(chat.archived, false)))
		.orderBy(desc(chat.updatedAt));
}

export async function getChatById(chatId: string, userId: string) {
	const [result] = await db
		.select()
		.from(chat)
		.where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
	return result ?? null;
}

export async function getChatMessages(chatId: string, userId: string) {
	const [result] = await db
		.select({ messages: chat.messages, vocabulary: chat.vocabulary })
		.from(chat)
		.where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
	return result ?? null;
}

export async function getChatVocabulary(chatId: string, userId: string) {
	const [result] = await db
		.select({ vocabulary: chat.vocabulary })
		.from(chat)
		.where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
	return result ?? null;
}

export async function createChat(userId: string, targetLanguage: string) {
	const [newChat] = await db
		.insert(chat)
		.values({ userId, targetLanguage, title: targetLanguage })
		.returning({ id: chat.id });
	return newChat;
}

export async function deleteChat(chatId: string, userId: string) {
	await db.delete(chat).where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
}

export async function updateChatMessages(chatId: string, userId: string, messages: UIMessage[]) {
	await db
		.update(chat)
		.set({ messages: [...messages], updatedAt: new Date() })
		.where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
}

export async function updateChatVocabulary(
	chatId: string,
	userId: string,
	vocabulary: VocabEntry[]
) {
	await db
		.update(chat)
		.set({ vocabulary })
		.where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
}
