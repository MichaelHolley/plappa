<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { authClient } from '$lib/auth-client';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Spinner } from '$lib/components/ui/spinner';
	import { chatStore } from '$lib/stores/chat-store.svelte';
	import { onMount } from 'svelte';
	import './layout.css';

	const PUBLIC_ROUTES = ['/login', '/signup'];

	let { children, data } = $props();

	const session = authClient.useSession();

	const isPublicRoute = $derived(PUBLIC_ROUTES.includes(page.url.pathname));

	onMount(() => {
		if (isPublicRoute) {
			authClient.signOut();
			return;
		}
	});

	$effect(() => {
		chatStore.setChats(data.chats);
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
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if $session.isPending}
	<main class="flex h-svh w-svh items-center justify-center">
		<Spinner class="size-8" />
	</main>
{:else}
	<div>
		{#if !isPublicRoute}
			<Sidebar.Provider>
				<AppSidebar />
				<main class="flex h-svh w-full flex-col">
					<div class="flex shrink-0 flex-row items-center space-x-3 border-b py-2">
						<Sidebar.Trigger />
						<h2>{chatStore.currentChat?.title}</h2>
					</div>
					<div class="min-h-0 flex-1">
						{@render children()}
					</div>
				</main>
			</Sidebar.Provider>
		{:else}
			<main class="h-svh">
				{@render children()}
			</main>
		{/if}
	</div>
{/if}
