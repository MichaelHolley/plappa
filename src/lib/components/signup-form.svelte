<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button/';
	import * as Card from '$lib/components/ui/card/';
	import { Field, FieldDescription, FieldGroup, FieldLabel } from '$lib/components/ui/field/';
	import { Input } from '$lib/components/ui/input/';

	const id = $props.id();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		const res = await authClient.signIn.email(
			{
				email,
				password,
				callbackURL: '/'
			},
			{
				onSuccess: async () => {
					goto(resolve('/'));
				}
			}
		);

		if (res.error) {
			error = res.error.message ?? 'Login failed';
			loading = false;
			return;
		}
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Create account</Card.Title>
		<Card.Description>Enter your details below to create your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleSubmit}>
			<FieldGroup>
				<Field>
					<FieldLabel for="name-{id}">Name</FieldLabel>
					<Input id="name-{id}" type="text" placeholder="Your name" bind:value={name} required />
				</Field>
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
					<FieldLabel for="password-{id}">Password</FieldLabel>
					<Input id="password-{id}" type="password" bind:value={password} required />
				</Field>
				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}
				<Field>
					<Button type="submit" class="w-full" disabled={loading}>
						{loading ? 'Creating account…' : 'Sign up'}
					</Button>
					<FieldDescription class="text-center">
						Already have an account? <a href={resolve('/login')} class="underline">Login</a>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
