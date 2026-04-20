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

## Phase 3 — Server load functions + form actions

Use SvelteKit server load functions and form actions where possible. Only the streaming chat endpoint stays as an API route.

**`src/routes/+layout.server.ts`**

- `load` — fetch current user's non-archived chats (`id, title, updatedAt`) ordered by `updatedAt desc`. Pass to sidebar. Redirect unauthenticated → `/login`.
- `actions.deleteChat` — delete chat by id, verify owner.

**`src/routes/+page.server.ts`** (root — "new chat" screen)

- `actions.createChat` — body `{ targetLanguage }`. Insert row, return `{ id }`. On success, redirect to `/chat/[id]`.

**`src/routes/chat/[id]/+page.server.ts`**

- `load` — fetch chat by id, verify `chat.userId === session.userId`, else 404. Return `{ chat }` with full messages.

**`src/routes/api/chat/+server.ts`** (stays as API route — streaming requires it)

- Accept `{ chatId, messages }`.
- `requireAuth()`, verify chat owner.
- `streamText(...)` — no `onFinish` here.
- Persist via `result.toUIMessageStreamResponse({ originalMessages: messages, onFinish({ messages }) })` — `onFinish` receives full updated `UIMessage[]` (original + response), write to DB.

## Phase 4 — Routes + client

- New route `src/routes/chat/[id]/+page.svelte`:
  - Hydrate `Chat` from `@ai-sdk/svelte` with `id: chatId` + `initialMessages` from load.
- Root `src/routes/+page.svelte`:
  - Strip all `localStorage` code.
  - Render "new chat" form (language select) → submit → `createChat` action → redirect `/chat/[id]`.
- Sidebar (`src/lib/components/app-sidebar.svelte`):
  - Receive chat list from layout load data.
  - Each entry = link + delete form using `deleteChat` action.

## Phase 5 — Auth gate

- Root layout `load` handles redirect for all routes — single auth check covers everything.

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
