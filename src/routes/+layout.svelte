<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import { onMount } from 'svelte';

	const PUBLIC_ROUTES = ['/login', '/signup'];

	let { children } = $props();

	const session = authClient.useSession();

	const isPublicRoute = $derived(PUBLIC_ROUTES.includes(page.url.pathname));

	onMount(() => {
		if (isPublicRoute) {
			authClient.signOut();
			return;
		}
	});

	$effect(() => {
		if ($session.isPending) return;

		if (isPublicRoute && $session.data) {
			authClient.signOut();
			return;
		}

		if (!isPublicRoute && (!$session.data || !$session.data.user)) {
			goto(resolve('/login'));
			return;
		}
	});

	const isPublic = $derived(PUBLIC_ROUTES.includes(page.url.pathname));
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if $session.isPending}
	<main class="flex h-svh w-svh items-center justify-center">
		<Spinner class="size-8" />
	</main>
{:else}
	<div>
		{#if !isPublic}
			<Sidebar.Provider>
				<AppSidebar />
				<main class="h-full w-full">
					<Sidebar.Trigger />
					{@render children()}
				</main>
			</Sidebar.Provider>
		{:else}
			<main class="h-svh">
				{@render children()}
			</main>
		{/if}
	</div>
{/if}
