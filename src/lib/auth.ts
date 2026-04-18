import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './auth-schema';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { DATABASE_URL } from '$env/static/private';

const db = drizzle(new Pool({ connectionString: DATABASE_URL }), {
	schema
});

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg', schema }),
	baseURL: 'http://localhost:5173/',
	emailAndPassword: { enabled: true },
	plugins: [sveltekitCookies(getRequestEvent)]
});
