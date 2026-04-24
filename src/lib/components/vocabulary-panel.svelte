<script lang="ts">
	import { cn } from '$lib/utils';
	import type { VocabEntry } from '$lib/types';

	interface Props {
		entries: VocabEntry[];
		class?: string;
	}

	let { entries, class: className }: Props = $props();
</script>

<div class={cn('flex w-72 flex-col border-l bg-background', className)}>
	<div class="border-b px-4 py-3">
		<h2 class="text-sm font-semibold tracking-tight">Vocabulary</h2>
	</div>
	<div class="flex-1 space-y-2 overflow-y-auto p-3">
		{#if entries.length === 0}
			<p class="mt-8 text-center text-sm text-muted-foreground">
				No vocabulary yet. Start chatting to see words here.
			</p>
		{:else}
			{#each entries as entry (entry.word)}
				<div class="space-y-1 rounded-md border p-3">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-sm font-semibold text-primary">{entry.word}</span>
						<span class="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
							{entry.partOfSpeech}
						</span>
					</div>
					<p class="text-xs text-muted-foreground">{entry.translation}</p>
					<p class="text-xs italic">{entry.example}</p>
				</div>
			{/each}
		{/if}
	</div>
</div>
