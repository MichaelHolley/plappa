<script lang="ts">
	import { Message, MessageContent, MessageResponse } from '$lib/components/ai-elements/message';
	import type { Message as PromptMessage } from '$lib/components/ai-elements/prompt-input';
	import * as PromptInput from '$lib/components/ai-elements/prompt-input';
	import { Chat } from '@ai-sdk/svelte';
	import { browser } from '$app/environment';

	const CHAT_ID = 'plappa-main-chat';

	const savedMessages = browser ? JSON.parse(localStorage.getItem(CHAT_ID) ?? 'null') : null;

	const chat = new Chat({
		id: CHAT_ID,
		messages: savedMessages ?? [],
		onFinish() {
			localStorage.setItem(CHAT_ID, JSON.stringify(chat.messages));
		}
	});

	function handleSubmit(message: PromptMessage) {
		chat.sendMessage({ text: message.text });
	}
</script>

<main class="flex h-full flex-col gap-1 p-2">
	<div class="mt-4 h-full w-full overflow-y-auto pr-4">
		<ul>
			{#each chat.messages as message, messageIndex (messageIndex)}
				<Message from={message.role} class="my-4">
					<MessageContent>
						{#each message.parts as msgPart, partIndex (partIndex)}
							{#if msgPart.type === 'text'}
								<MessageResponse content={msgPart.text} class="my-3" />
							{/if}
						{/each}
					</MessageContent>
				</Message>
			{/each}
		</ul>
	</div>

	<div>
		<PromptInput.Root class="max-w-xl" onSubmit={handleSubmit}>
			<PromptInput.Body>
				<PromptInput.Textarea />
			</PromptInput.Body>
			<PromptInput.Toolbar class="justify-end">
				<PromptInput.Submit />
			</PromptInput.Toolbar>
		</PromptInput.Root>
	</div>
</main>
