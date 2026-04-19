# Chat Persistence — Plan

Persist user chats in PostgreSQL via Drizzle ORM. Replace current `localStorage` single-chat flow with per-user DB-backed chats.

## Decisions

| Item                | Choice                                                                             |
| ------------------- | ---------------------------------------------------------------------------------- |
| Schema file         | new `src/lib/chat-schema.ts`                                                       |
| Drizzle config      | glob `./src/lib/*-schema.ts`                                                       |
| Table shape         | single `chat` table, `messages: jsonb` holds full `UIMessage[]`                    |
| Columns             | `id, userId, title, targetLanguage, messages, archived, createdAt, updatedAt`      |
| `id` type           | `uuid` (Postgres native, `defaultRandom()`)                                        |
| `userId` FK         | `onDelete: 'cascade'`                                                              |
| `title`             | default literal `"Untitled"` (UI rename later)                                     |
| `targetLanguage`    | required on create (no default)                                                    |
| `archived`          | boolean, default `false`                                                           |
| `messages`          | `jsonb`, default `'[]'`                                                            |
| localStorage        | wipe — no migration, clean cutover                                                 |
| MVP ops             | create, append, load, list, delete                                                 |
| Title generation    | deferred                                                                           |
| Rename / archive UI | deferred                                                                           |
| Migrations          | `db:generate` + `db:migrate`, commit SQL                                           |
| Persistence timing  | AI SDK `onFinish` inside `streamText` — write full `UIMessage[]` after stream done |

## Phase 1 — Schema + migration

1. Create `src/lib/chat-schema.ts`:
   - `chat` table with columns above.
   - Relation `chat.userId` → `user.id`.
   - Export inferred `Chat` + `NewChat` types.
2. Update `drizzle.config.ts` → `schema: './src/lib/*-schema.ts'`.
3. Run `pnpm db:generate` → first SQL file in `drizzle/` (covers existing auth tables + new `chat` table).
4. Run `pnpm db:migrate` → apply to DB.
5. Commit `drizzle/` folder.

## Phase 2 — Shared DB client

- Extract drizzle instance from `src/lib/auth.ts` into `src/lib/server/db.ts`.
- Single `pg.Pool`, single `drizzle()` client, imports all `*-schema.ts`.
- `auth.ts` re-uses same instance via `drizzleAdapter`.
- Avoids double connection pool.

## Phase 3 — Server endpoints (`src/routes/api/`)

- `POST /api/chats` — body `{ targetLanguage }`. Insert row with default title, empty messages, userId from session. Return `{ id }`.
- `GET /api/chats` — list current user's non-archived chats: `id, title, updatedAt`, ordered by `updatedAt desc`.
- `GET /api/chats/[id]` — load one. Verify `chat.userId === session.userId`, else 404.
- `DELETE /api/chats/[id]` — delete, verify owner.
- Modify `POST /api/chat/+server.ts`:
  - Accept `{ chatId, messages }` in body.
  - `requireAuth()`, verify chat owner.
  - `streamText({ ..., onFinish: ({ response }) => updateChat(chatId, [...messages, ...response.messages]) })`.
  - Bump `updatedAt`.
- Auth: `requireAuth()` on every endpoint.

## Phase 4 — Routes + client

- New route `/chat/[id]/+page.svelte`:
  - `+page.server.ts` load — fetch chat by id, ownership check, return initial `messages`.
  - Hydrate `Chat` from `@ai-sdk/svelte` with `id: chatId` + `initialMessages`.
- Root `+page.svelte`:
  - Strip all `localStorage` code.
  - Render "new chat" form (language select) → POST `/api/chats` → navigate `/chat/[id]`.
- Sidebar:
  - Server-load chat list in root layout, pass to sidebar.
  - Each entry = link + delete button (confirm dialog).

## Phase 5 — Auth gate

- `requireAuth()` on all new `/api/chats*` endpoints.
- Gate `/chat/*` via `+layout.server.ts` (redirect unauth → login).

## Schema sketch

```ts
// src/lib/chat-schema.ts
import { pgTable, uuid, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth-schema';
import type { UIMessage } from 'ai';

export const chat = pgTable('chat', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull().default('Untitled'),
	targetLanguage: text('target_language').notNull(),
	messages: jsonb('messages').$type<UIMessage[]>().notNull().default([]),
	archived: boolean('archived').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const chatRelations = relations(chat, ({ one }) => ({
	user: one(user, { fields: [chat.userId], references: [user.id] })
}));

export type Chat = typeof chat.$inferSelect;
export type NewChat = typeof chat.$inferInsert;
```

## Deferred (not MVP)

- Auto-generate title from first user message.
- Rename chat UI.
- Archive toggle UI.
- Per-chat model snapshot column.
- Proficiency level, lesson linkage.
- Streaming-resume on disconnect (accept lost partial message for now).
