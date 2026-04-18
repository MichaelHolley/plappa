<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button/';
	import * as Card from '$lib/components/ui/card/';
	import { Field, FieldDescription, FieldGroup, FieldLabel } from '$lib/components/ui/field/';
	import { Input } from '$lib/components/ui/input/';

	const id = $props.id();

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		const res = await authClient.signIn.email({
			email,
			password,
			callbackURL: '/'
		});

		if (res.error) {
			error = res.error.message ?? 'Login failed';
			loading = false;
			return;
		}

		goto(resolve('/'));
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleSubmit}>
			<FieldGroup>
				<Field>
					<FieldLabel for="email-{id}">Email</FieldLabel>
					<Input
						id="email-{id}"
						type="email"
						placeholder="your-email@example.com"
						bind:value={email}
						required
					/>
				</Field>
				<Field>
					<div class="flex items-center">
						<FieldLabel for="password-{id}">Password</FieldLabel>
					</div>
					<Input id="password-{id}" type="password" bind:value={password} required />
				</Field>
				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}
				<Field>
					<Button type="submit" class="w-full" disabled={loading}>
						{loading ? 'Logging in…' : 'Login'}
					</Button>
					<FieldDescription class="text-center">
						Don't have an account? <a href={resolve('/signup')} class="underline">Sign up</a>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
