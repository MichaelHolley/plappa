<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { getLanguageFlag } from '$lib/languages';
	import { chatStore } from '$lib/stores/chat-store.svelte';
	import type { ChatSummary } from '$lib/types';
	import ArchiveIcon from '@lucide/svelte/icons/archive';
	import ArchiveRestoreIcon from '@lucide/svelte/icons/archive-restore';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	interface LanguageGroup {
		language: string;
		flag: string;
		chats: ChatSummary[];
	}

	const session = authClient.useSession();

	let searchQuery = $state('');
	let showArchived = $state(false);
	let renameOpen = $state(false);
	let renameTarget = $state<ChatSummary | null>(null);
	let renameValue = $state('');

	const initial = $derived($session.data?.user.name?.charAt(0).toUpperCase() ?? '?');

	const groupedChats = $derived.by(() => groupByLanguage(filterChats(chatStore.chats)));
	const filteredArchivedChats = $derived(filterChats(chatStore.archivedChats));

	function filterChats(chats: ChatSummary[]): ChatSummary[] {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return chats;
		return chats.filter((c) => c.title.toLowerCase().includes(query));
	}

	function groupByLanguage(chats: ChatSummary[]): LanguageGroup[] {
		const groups: LanguageGroup[] = [];
		for (const chat of chats) {
			let group = groups.find((g) => g.language === chat.targetLanguage);
			if (!group) {
				group = {
					language: chat.targetLanguage,
					flag: getLanguageFlag(chat.targetLanguage),
					chats: []
				};
				groups.push(group);
			}
			group.chats.push(chat);
		}
		return groups;
	}

	function openRename(chat: ChatSummary) {
		renameTarget = chat;
		renameValue = chat.title;
		renameOpen = true;
	}

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
			<Sidebar.GroupContent>
				<div class="relative">
					<SearchIcon
						class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Sidebar.Input
						bind:value={searchQuery}
						placeholder="Search chats..."
						class="pl-8"
						aria-label="Search chats"
					/>
				</div>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		{#each groupedChats as group (group.language)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.flag} {group.language}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.chats as chat (chat.id)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={chatStore.currentChatId === chat.id}>
									{#snippet child({ props })}
										<a href={resolve(`/chat/${chat.id}`)} {...props} title={chat.title}>
											<span>{chat.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Sidebar.MenuAction {...props} showOnHover aria-label="Chat options">
												<MoreHorizontalIcon />
											</Sidebar.MenuAction>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content side="right" align="start">
										<DropdownMenu.Item onSelect={() => openRename(chat)}>
											<PencilIcon />
											<span>Rename</span>
										</DropdownMenu.Item>
										<DropdownMenu.Item closeOnSelect={false}>
											{#snippet child({ props })}
												<form
													method="POST"
													action="/?/archiveChat"
													use:enhance={() =>
														async ({ result, update }) => {
															await update();
															if (result.type === 'success' && chatStore.currentChatId === chat.id)
																goto(resolve('/'));
														}}
												>
													<input type="hidden" name="id" value={chat.id} />
													<button type="submit" {...props}>
														<ArchiveIcon />
														<span>Archive</span>
													</button>
												</form>
											{/snippet}
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<DropdownMenu.Item variant="destructive" closeOnSelect={false}>
											{#snippet child({ props })}
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
													<button type="submit" {...props}>
														<TrashIcon />
														<span>Delete</span>
													</button>
												</form>
											{/snippet}
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}

		{#if chatStore.archivedChats.length > 0}
			<Sidebar.Group>
				<Sidebar.GroupLabel>
					{#snippet child({ props })}
						<button
							{...props}
							onclick={() => (showArchived = !showArchived)}
							class="{props.class} flex w-full items-center gap-1"
						>
							<ChevronDownIcon
								class="size-4 transition-transform {showArchived ? '' : '-rotate-90'}"
							/>
							<span>Archived</span>
						</button>
					{/snippet}
				</Sidebar.GroupLabel>
				{#if showArchived}
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each filteredArchivedChats as chat (chat.id)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive={chatStore.currentChatId === chat.id}>
										{#snippet child({ props })}
											<a href={resolve(`/chat/${chat.id}`)} {...props} title={chat.title}>
												<span>{getLanguageFlag(chat.targetLanguage)} {chat.title}</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											{#snippet child({ props })}
												<Sidebar.MenuAction {...props} showOnHover aria-label="Chat options">
													<MoreHorizontalIcon />
												</Sidebar.MenuAction>
											{/snippet}
										</DropdownMenu.Trigger>
										<DropdownMenu.Content side="right" align="start">
											<DropdownMenu.Item closeOnSelect={false}>
												{#snippet child({ props })}
													<form
														method="POST"
														action="/?/unarchiveChat"
														use:enhance={() =>
															async ({ update }) => {
																await update();
															}}
													>
														<input type="hidden" name="id" value={chat.id} />
														<button type="submit" {...props}>
															<ArchiveRestoreIcon />
															<span>Restore</span>
														</button>
													</form>
												{/snippet}
											</DropdownMenu.Item>
											<DropdownMenu.Separator />
											<DropdownMenu.Item variant="destructive" closeOnSelect={false}>
												{#snippet child({ props })}
													<form
														method="POST"
														action="/?/deleteChat"
														use:enhance={() =>
															async ({ result, update }) => {
																await update();
																if (
																	result.type === 'success' &&
																	chatStore.currentChatId === chat.id
																)
																	goto(resolve('/'));
															}}
													>
														<input type="hidden" name="id" value={chat.id} />
														<button type="submit" {...props}>
															<TrashIcon />
															<span>Delete</span>
														</button>
													</form>
												{/snippet}
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				{/if}
			</Sidebar.Group>
		{/if}
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

<Dialog.Root bind:open={renameOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Rename chat</Dialog.Title>
			<Dialog.Description>Give this chat a new title.</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="/?/renameChat"
			use:enhance={() => {
				const id = renameTarget?.id;
				const title = renameValue.trim();
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success' && id) {
						chatStore.updateChatTitle(id, title);
						renameOpen = false;
					}
				};
			}}
		>
			<input type="hidden" name="id" value={renameTarget?.id ?? ''} />
			<Input name="title" bind:value={renameValue} placeholder="Chat title" autocomplete="off" />
			<Dialog.Footer class="mt-4">
				<Button type="button" variant="outline" onclick={() => (renameOpen = false)}>Cancel</Button>
				<Button type="submit" disabled={!renameValue.trim()}>Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
