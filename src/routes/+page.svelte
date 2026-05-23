<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';

	const LANGUAGES = [
		{ value: 'Spanish', label: '🇪🇸 Spanish' },
		{ value: 'French', label: '🇫🇷 French' },
		{ value: 'German', label: '🇩🇪 German' },
		{ value: 'Italian', label: '🇮🇹 Italian' },
		{ value: 'Portuguese', label: '🇧🇷 Portuguese' }
	];

	let selectedLanguage = $state('');
</script>

<div class="flex h-full items-center justify-center">
	<div class="w-full max-w-sm space-y-6">
		<div class="space-y-1 text-center">
			<h1 class="text-2xl font-semibold">Start a new chat</h1>
			<p class="text-sm text-muted-foreground">Choose the language you want to practice</p>
		</div>

		<form method="POST" action="?/createChat" use:enhance class="space-y-4">
			<input type="hidden" name="targetLanguage" value={selectedLanguage} />
			<div class="space-y-2">
				<Label for="targetLanguage">Target language</Label>
				<Select.Root type="single" bind:value={selectedLanguage}>
					<Select.Trigger class="w-full">
						{selectedLanguage
							? (LANGUAGES.find((l) => l.value === selectedLanguage)?.label ?? selectedLanguage)
							: 'Select a language'}
					</Select.Trigger>
					<Select.Content>
						{#each LANGUAGES as lang (lang.value)}
							<Select.Item value={lang.value}>{lang.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<Button type="submit" class="w-full" disabled={!selectedLanguage}>Start chatting</Button>
		</form>
	</div>
</div>
