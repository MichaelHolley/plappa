<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Correction } from '$lib/types';

	type Props = Correction;

	const { original, corrected, explanation, severity }: Props = $props();
</script>

<div
	class={cn(
		'my-1 rounded-r-md border-l-4 bg-white px-3 py-2 text-sm dark:bg-zinc-900',
		severity === 'minor' && 'border-amber-400',
		severity === 'major' && 'border-rose-500',
		!severity && 'border-zinc-300 dark:border-zinc-600'
	)}
>
	<div class="mb-1 flex items-center gap-2">
		<span
			class={cn(
				'rounded px-1.5 py-0.5 text-xs font-semibold tracking-wide uppercase',
				severity === 'minor' &&
					'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
				severity === 'major' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
				!severity && 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
			)}
		>
			Correction
		</span>
	</div>

	<div class="flex flex-wrap items-baseline gap-1.5">
		<span class="text-zinc-400 line-through dark:text-zinc-500">{original}</span>
		<span class="text-zinc-400 dark:text-zinc-500">→</span>
		<span
			class={cn(
				'font-semibold',
				severity === 'minor' && 'text-amber-700 dark:text-amber-400',
				severity === 'major' && 'text-rose-700 dark:text-rose-400',
				!severity && 'text-zinc-800 dark:text-zinc-100'
			)}
		>
			{corrected}
		</span>
	</div>

	<p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{explanation}</p>
</div>
