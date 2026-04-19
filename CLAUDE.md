# Plappa

AI-powered language tutoring app. Users chat with an AI tutor that corrects mistakes and coaches language learning in real time.

## Architecture

**Stack**: SvelteKit + Svelte, TailwindCSS, shadcn-svelte, Better Auth, Drizzle ORM (PostgreSQL), Vercel AI SDK + OpenRouter, Svelte AI Elements

## Code conventions

### State & Reactivity

Svelte 5 runes (`$state`, `$derived`, `$effect`) are used throughout.
Use `SvelteMap` and `SvelteSet` over vanilla JS `Map` and `Set`.

In a page or component there must be a strict hierarchy from top to bottom:

1. defining interfaces and types
2. props
3. `$state` runes
4. `$derived` runes
5. `$effect` runes
6. functions

### UI Components

- shadcn-svelte components live in `src/lib/components/ui/`
- ai-elements components live in `src/lib/components/ai-elements`
- `cn()` utility (clsx + tailwind-merge) is in `src/lib/utils.ts`
- Path alias `@/*` maps to `src/lib/*`
- App related components live in `src/lib/components/` and a dedicated directory if a group is applicable. Use kebab-case.

## Git

Use conventional commit messages like 'feat:', 'fix:', 'chore:', ...
