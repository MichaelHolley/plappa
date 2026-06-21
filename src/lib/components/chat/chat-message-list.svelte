<script lang="ts">
	import { Message, MessageContent, MessageResponse } from '$lib/components/ai-elements/message';
	import {
		ChatContainerContent,
		ChatContainerRoot
	} from '$lib/components/prompt-kit/chat-container';
	import ChatWelcome from './chat-welcome.svelte';
	import ChatTypingIndicator from './chat-typing-indicator.svelte';
	import type { Chat } from '@ai-sdk/svelte';

	interface Props {
		messages: Chat['messages'];
		language: string;
		showTyping: boolean;
		onwelcomesend: (text: string) => void;
	}

	let { messages, language, showTyping, onwelcomesend }: Props = $props();
</script>

<ChatContainerRoot class="flex-1 flex-col">
	<ChatContainerContent class="space-y-4 pr-1">
		{#if messages.length === 0}
			<ChatWelcome {language} onsend={onwelcomesend} />
		{/if}
		{#each messages as message (message.id)}
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
		{#if showTyping}
			<Message from="assistant">
				<MessageContent>
					<ChatTypingIndicator />
				</MessageContent>
			</Message>
		{/if}
	</ChatContainerContent>
</ChatContainerRoot>
