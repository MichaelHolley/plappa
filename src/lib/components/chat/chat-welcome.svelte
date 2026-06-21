<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/';

	interface Props {
		language: string;
		onsend: (message: string) => void;
	}

	type Proficiency = 'beginner' | 'intermediate' | 'advanced' | null;

	let { language, onsend }: Props = $props();

	let selectedProficiency = $state<Proficiency>(null);

	const PROFICIENCY_OPTIONS = [
		{ value: 'beginner' as const, label: 'Beginner', sub: 'A1–A2', article: 'a' },
		{ value: 'intermediate' as const, label: 'Intermediate', sub: 'B1–B2', article: 'an' },
		{ value: 'advanced' as const, label: 'Advanced', sub: 'C1–C2', article: 'an' }
	];

	const SCENARIO_OPTIONS = [
		{ value: 'travel', label: 'Travel & transportation', emoji: '✈️' },
		{ value: 'food', label: 'Food & dining', emoji: '🍽️' },
		{ value: 'work', label: 'Work & professional', emoji: '💼' },
		{ value: 'casual', label: 'Casual conversation', emoji: '💬' },
		{ value: 'shopping', label: 'Shopping', emoji: '🛍️' },
		{ value: 'daily', label: 'Daily routines', emoji: '📅' }
	];

	function toggleProficiency(value: Proficiency) {
		selectedProficiency = selectedProficiency === value ? null : value;
	}

	function handleScenarioClick(scenario: (typeof SCENARIO_OPTIONS)[number]) {
		const p = PROFICIENCY_OPTIONS.find((p) => p.value === selectedProficiency);
		const message = p
			? `I'm ${p.article} ${p.label.toLowerCase()} and want to practice ${scenario.label.toLowerCase()} in ${language}`
			: `I want to practice ${scenario.label.toLowerCase()} in ${language}`;
		onsend(message);
	}
</script>

<div class="flex flex-col items-center gap-6 py-10 text-center">
	<div class="space-y-1">
		<p class="text-2xl font-semibold">Start learning {language}</p>
		<p class="max-w-sm text-sm text-muted-foreground">
			Pick your level and a topic to jump in, or just start typing.
		</p>
	</div>

	<div class="flex flex-col items-center gap-2">
		<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Your level</p>
		<div class="flex gap-2">
			{#each PROFICIENCY_OPTIONS as option (option.value)}
				<Button
					type="button"
					variant={selectedProficiency === option.value ? 'default' : 'outline'}
					size="sm"
					onclick={() => toggleProficiency(option.value)}
					class="flex h-auto flex-col px-3 py-2"
				>
					<span class="text-sm font-medium">{option.label}</span>
					<span class="text-xs opacity-70">{option.sub}</span>
				</Button>
			{/each}
		</div>
	</div>

	<div class="flex w-full max-w-sm flex-col items-center gap-2">
		<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
			What do you want to practice?
		</p>
		<div class="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
			{#each SCENARIO_OPTIONS as scenario (scenario.value)}
				<button
					type="button"
					onclick={() => handleScenarioClick(scenario)}
					class={cn(
						'flex cursor-pointer flex-col items-center gap-1 rounded-xl border bg-card p-3 text-center text-sm transition-colors hover:bg-muted'
					)}
				>
					<span class="text-2xl">{scenario.emoji}</span>
					<span class="text-xs text-muted-foreground">{scenario.label}</span>
				</button>
			{/each}
		</div>
	</div>
</div>
