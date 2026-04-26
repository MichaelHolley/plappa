<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import type { VocabEntry } from '$lib/types';
	import { BookOpen } from '@lucide/svelte';

	interface Props {
		entries: VocabEntry[];
	}

	let { entries }: Props = $props();
</script>

<Drawer.Root>
	<Drawer.Trigger
		class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
	>
		<BookOpen class="h-4 w-4" />
		<span>Vocabulary</span>
		{#if entries.length > 0}
			<span
				class="rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground"
			>
				{entries.length}
			</span>
		{/if}
	</Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Vocabulary</Drawer.Title>
		</Drawer.Header>
		<div class="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
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
	</Drawer.Content>
</Drawer.Root>
