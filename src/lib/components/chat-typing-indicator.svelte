<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();
</script>

<div
	class={cn('flex items-center gap-1 py-2', className)}
	role="status"
	aria-label="Tutor is typing"
>
	<span class="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]"
	></span>
	<span class="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]"
	></span>
	<span class="size-2 animate-bounce rounded-full bg-muted-foreground/60"></span>
	<span class="sr-only">Tutor is typing…</span>
</div>
