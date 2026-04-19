import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as authSchema from './auth-schema';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_URL } from '$env/static/private';
import { db } from './server/db';

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
	appName: 'Plappa',
	baseURL: BETTER_AUTH_URL,
	emailAndPassword: { enabled: true, requireEmailVerification: false, autoSignIn: true },
	plugins: [sveltekitCookies(getRequestEvent)]
});
