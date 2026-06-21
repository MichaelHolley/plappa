<script lang="ts">
	import { ChatSession } from '$lib/components/chat/chat-session.svelte.js';
	import ChatInput from '$lib/components/chat/chat-input.svelte';
	import ChatMessageList from '$lib/components/chat/chat-message-list.svelte';
	import VocabularyDrawer from '$lib/components/vocabulary-drawer.svelte';
	import VocabularyPanel from '$lib/components/vocabulary-panel.svelte';
	import { chatStore } from '$lib/stores/chat-store.svelte.js';

	let { data } = $props();

	// Re-created on navigation between chats (data.chat changes).
	let session = $derived(new ChatSession(data.chat));

	$effect(() => {
		chatStore.setCurrentChatId(data.chat.id);
	});

	$effect(() => {
		session.processToolCalls();
	});
</script>

<div class="flex h-full">
	<div class="flex min-w-0 flex-1 justify-center overflow-hidden">
		<div class="flex h-full w-full max-w-2xl flex-col space-y-3 p-2 pb-3">
			<div class="flex items-center justify-end lg:hidden">
				<VocabularyDrawer entries={session.vocabulary} />
			</div>

			<ChatMessageList
				messages={session.chat.messages}
				language={data.chat.targetLanguage}
				showTyping={session.showTypingIndicator}
				onwelcomesend={(text) => session.send(text)}
			/>

			<div>
				<ChatInput
					status={session.chat.status}
					onsubmit={(message) => session.send(message.text)}
					onstop={() => session.stop()}
				/>
			</div>
		</div>
	</div>
	<VocabularyPanel entries={session.vocabulary} class="hidden lg:flex" />
</div>
