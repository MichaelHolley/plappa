# Plappa

AI-powered language tutor that guides beginners through real conversation scenarios, corrects mistakes inline, and tracks progress over time.

## Stack

- **Frontend**: SvelteKit + Svelte 5 + Tailwind CSS v4 + shadcn-svelte
- **AI**: OpenRouter via Vercel AI SDK (`deepseek/deepseek-v3-2` by default)
- **Auth**: Better Auth (email + password)
- **DB**: Drizzle ORM + PostgreSQL 17 (Docker)

## Getting Started

**1. Start the database**

```bash
docker compose up -d
```

**2. Install dependencies**

```bash
bun install
```

**3. Configure environment**

```bash
cp .env.example .env
```

Fill in:

```env
DB_URL=postgres://plappa:plappa@localhost:5432/plappa
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL_NAME=deepseek/deepseek-v3.2
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:5173
```

**4. Run migrations**

```bash
bunx drizzle-kit migrate
```

**5. Start dev server**

```bash
bun dev
```

## How It Works

1. User signs up and selects a target language
2. New chat is created, locked to that language
3. AI tutor drives conversation via scenario, corrects mistakes inline
4. Messages persisted to Postgres as JSONB on stream completion
5. Chat history accessible from sidebar
