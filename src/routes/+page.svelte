<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { Message, MessageContent, MessageResponse } from '$lib/components/ai-elements/message';

	let input = $state('');
	const chat = new Chat({});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		chat.sendMessage({ text: input });
		input = '';
	}
</script>

<main>
	<ul>
		{#each chat.messages as message, messageIndex (messageIndex)}
			<Message from={message.role}>
				<MessageContent>
					{#each message.parts as msgPart, partIndex (partIndex)}
						{#if msgPart.type === 'text'}
							<MessageResponse content={msgPart.text} />
						{/if}
					{/each}
				</MessageContent>
			</Message>
		{/each}
	</ul>

	<form onsubmit={handleSubmit} class="border p-2">
		<input bind:value={input} class="border border-black" />
		<button type="submit">Send</button>
	</form>
</main>
