<script lang="ts">
	import { Message, MessageContent, MessageResponse } from '$lib/components/ai-elements/message';
	import type { Message as PromptMessage } from '$lib/components/ai-elements/prompt-input';
	import * as PromptInput from '$lib/components/ai-elements/prompt-input';
	import {
		ChatContainerContent,
		ChatContainerRoot
	} from '$lib/components/prompt-kit/chat-container';
	import VocabularyPanel from '$lib/components/vocabulary-panel.svelte';
	import { chatStore } from '$lib/stores/chat-store.svelte.js';
	import type { VocabEntry } from '$lib/types';
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport, isToolUIPart } from 'ai';
	import { SvelteSet } from 'svelte/reactivity';

	let { data } = $props();

	let chat = $derived(
		new Chat({
			id: data.chat.id,
			messages: data.chat.messages,
			transport: new DefaultChatTransport({
				api: '/api/chat',
				prepareSendMessagesRequest({ messages, id }) {
					return { body: { message: messages[messages.length - 1], id } };
				}
			})
		})
	);

	$effect(() => {
		chatStore.setCurrentChatId(data.chat.id);
	});

	let vocabulary = $state<VocabEntry[]>(data.chat.vocabulary ?? []);
	const processedToolCallIds = new SvelteSet<string>();

	// Reset on chat switch — data.chat changes when navigating between chats
	$effect(() => {
		vocabulary = data.chat.vocabulary ?? [];
		processedToolCallIds.clear();
		for (const msg of data.chat.messages) {
			if (msg.role !== 'assistant') continue;
			for (const part of msg.parts ?? []) {
				if (isToolUIPart(part)) {
					processedToolCallIds.add(part.toolCallId);
				}
			}
		}
	});

	$effect(() => {
		for (const message of chat.messages) {
			if (message.role !== 'assistant') continue;
			for (const part of message.parts ?? []) {
				// AI SDK v6: tool parts have type `tool-${name}`, flat toolCallId/state/output
				if (!isToolUIPart(part) || part.type !== 'tool-addVocabulary') continue;
				const toolCallId = part.toolCallId;
				const state = (part as { state: string }).state;
				if (state !== 'output-available' || processedToolCallIds.has(toolCallId)) continue;
				processedToolCallIds.add(toolCallId);
				const output = (part as { output?: { added: VocabEntry[] } }).output;
				if (output?.added?.length) {
					vocabulary = [...vocabulary, ...output.added];
				}
			}
		}
	});

	function handleSubmit(message: PromptMessage) {
		chat.sendMessage({ text: message.text });
	}
</script>

<div class="flex h-full">
	<div class="flex min-w-0 flex-1 justify-center overflow-hidden">
		<div class="flex h-full w-full max-w-2xl flex-col space-y-3 p-2 pb-8">
			<ChatContainerRoot class="flex-1 flex-col">
				<ChatContainerContent class="space-y-4 pr-1">
					{#each chat.messages as message (message.id)}
						<Message from={message.role}>
							<MessageContent>
								{#each message.parts as msgPart, partIndex (partIndex)}
									{#if msgPart.type === 'text'}
										<MessageResponse
											content={msgPart.text}
											class="**:my-3 {message.role === 'user' ? '**:text-white' : ''}"
										/>
									{/if}
								{/each}
							</MessageContent>
						</Message>
					{/each}
				</ChatContainerContent>
			</ChatContainerRoot>

			<div>
				<PromptInput.Root onSubmit={handleSubmit}>
					<PromptInput.Body>
						<PromptInput.Textarea />
					</PromptInput.Body>
					<PromptInput.Toolbar class="justify-end">
						<PromptInput.Submit />
					</PromptInput.Toolbar>
				</PromptInput.Root>
			</div>
		</div>
	</div>
	<VocabularyPanel entries={vocabulary} class="hidden md:flex" />
</div>
