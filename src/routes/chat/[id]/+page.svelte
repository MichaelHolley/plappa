<script lang="ts">
	import { Message, MessageContent, MessageResponse } from '$lib/components/ai-elements/message';
	import type { Message as PromptMessage } from '$lib/components/ai-elements/prompt-input';
	import * as PromptInput from '$lib/components/ai-elements/prompt-input';
	import {
		ChatContainerContent,
		ChatContainerRoot
	} from '$lib/components/prompt-kit/chat-container';
	import { chatStore } from '$lib/stores/chat-store.svelte.js';
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport } from 'ai';

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

	function handleSubmit(message: PromptMessage) {
		chat.sendMessage({ text: message.text });
	}
</script>

<div class="mx-auto flex h-full max-w-2xl flex-col space-y-3 p-2 pb-8">
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
