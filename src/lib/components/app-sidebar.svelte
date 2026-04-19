<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ChatSummary } from '$lib/types';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import PlusIcon from '@lucide/svelte/icons/plus';

	const session = authClient.useSession();

	let chats = $state<ChatSummary[]>([]);

	const initial = $derived($session.data?.user.name?.charAt(0).toUpperCase() ?? '?');

	async function logout() {
		await authClient.signOut();
		goto(resolve('/login'));
	}
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href={resolve('/')} {...props}>
								<PlusIcon />
								<span>New Chat</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Group>

		<Sidebar.Group>
			<Sidebar.GroupLabel>Chats</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each chats as chat (chat.id)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={resolve('/')} {...props}>
										<span>{chat.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		<div class="flex items-center gap-3 px-2 py-1">
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground"
			>
				{initial}
			</div>
			<span class="flex-1 truncate text-sm font-medium">
				{$session.data?.user.name ?? ''}
			</span>
			<button onclick={logout} class="cursor-pointer text-muted-foreground hover:text-foreground">
				<LogOutIcon class="size-4" />
			</button>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
