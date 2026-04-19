import { relations } from 'drizzle-orm';
import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { UIMessage } from 'ai';
import { user } from './auth-schema';

export const chat = pgTable(
	'chat',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		title: text('title').notNull().default('Untitled'),
		targetLanguage: text('target_language').notNull(),
		messages: jsonb('messages').$type<UIMessage[]>().notNull().default([]),
		archived: boolean('archived').notNull().default(false),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [index('chat_userId_idx').on(table.userId)]
);

export const chatRelations = relations(chat, ({ one }) => ({
	user: one(user, { fields: [chat.userId], references: [user.id] })
}));

export type Chat = typeof chat.$inferSelect;
export type NewChat = typeof chat.$inferInsert;
