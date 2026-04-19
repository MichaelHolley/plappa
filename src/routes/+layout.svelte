<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let { children } = $props();

	const session = authClient.useSession();

	const PUBLIC_ROUTES = ['/login', '/signup'];

	$effect(() => {
		if ($session.isPending) return;
		const isPublic = PUBLIC_ROUTES.includes(page.url.pathname);
		if (!$session.data && !isPublic) {
			goto(resolve('/login'));
		} else if ($session.data && isPublic) {
			goto(resolve('/'));
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}
