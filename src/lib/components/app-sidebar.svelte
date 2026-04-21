<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { chatStore } from '$lib/stores/chat-store.svelte';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	const LANGUAGE_FLAGS: Record<string, string> = {
		arabic: '🇸🇦',
		chinese: '🇨🇳',
		dutch: '🇳🇱',
		french: '🇫🇷',
		german: '🇩🇪',
		greek: '🇬🇷',
		hindi: '🇮🇳',
		italian: '🇮🇹',
		japanese: '🇯🇵',
		korean: '🇰🇷',
		mandarin: '🇨🇳',
		polish: '🇵🇱',
		portuguese: '🇵🇹',
		russian: '🇷🇺',
		spanish: '🇪🇸',
		swedish: '🇸🇪',
		turkish: '🇹🇷',
		ukrainian: '🇺🇦'
	};

	function languageFlag(lang: string): string {
		return LANGUAGE_FLAGS[lang.toLowerCase()] ?? '🌐';
	}

	const session = authClient.useSession();
	const initial = $derived($session.data?.user.name?.charAt(0).toUpperCase() ?? '?');

	async function logout() {
		await authClient.signOut();
		goto(resolve('/login'));
	}
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<div class="flex items-center gap-2 px-2 py-1">
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-sm font-bold text-white"
			>
				P
			</div>
			<span class="text-base font-semibold">Plappa</span>
		</div>
	</Sidebar.Header>

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
					{#each chatStore.chats as chat (chat.id)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={chatStore.currentChatId === chat.id}>
								{#snippet child({ props })}
									<a href={resolve(`/chat/${chat.id}`)} {...props}>
										<span>{languageFlag(chat.targetLanguage)} {chat.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
							<Sidebar.MenuAction>
								<form
									method="POST"
									action="/?/deleteChat"
									use:enhance={() =>
										async ({ result, update }) => {
											await update();
											if (result.type === 'success') goto(resolve('/'));
										}}
								>
									<input type="hidden" name="id" value={chat.id} />
									<button
										type="submit"
										class="ml-auto p-1 text-muted-foreground opacity-0 group-hover/menu-item:opacity-100 hover:text-destructive"
										aria-label="Delete chat"
									>
										<TrashIcon class="size-3.5" />
									</button>
								</form>
							</Sidebar.MenuAction>
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
