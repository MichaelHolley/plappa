<script lang="ts">
	import type { Message as PromptMessage } from '$lib/components/ai-elements/prompt-input';
	import * as PromptInput from '$lib/components/ai-elements/prompt-input';
	import type { Chat } from '@ai-sdk/svelte';

	interface Props {
		status: Chat['status'];
		onsubmit: (message: PromptMessage) => void;
		onstop: () => void;
	}

	let { status, onsubmit, onstop }: Props = $props();
</script>

<PromptInput.Root onSubmit={onsubmit}>
	<PromptInput.Body>
		<PromptInput.Textarea placeholder="Type your message..." />
	</PromptInput.Body>
	<PromptInput.Toolbar class="justify-end">
		<PromptInput.Submit {status} onStop={onstop} />
	</PromptInput.Toolbar>
</PromptInput.Root>
