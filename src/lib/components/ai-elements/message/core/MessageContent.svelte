<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'flex w-fit max-w-full min-w-0 flex-col gap-2 overflow-hidden text-sm shadow-primary/30',
		'group-[.is-user]:color-white group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-primary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground group-[.is-user]:shadow-md',
		'group-[.is-assistant]:text-foreground',
		className
	)}
	{...restProps}
>
	{@render children()}
</div>
