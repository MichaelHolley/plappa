<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
</script>

<div class="flex h-full items-center justify-center">
	<div class="w-full max-w-sm space-y-6">
		<div class="space-y-1 text-center">
			<h1 class="text-2xl font-semibold">Start a new chat</h1>
			<p class="text-sm text-muted-foreground">Choose the language you want to practice</p>
		</div>

		<form method="POST" action="?/createChat" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="targetLanguage">Target language</Label>
				<Input
					id="targetLanguage"
					name="targetLanguage"
					placeholder="e.g. Spanish, French, Japanese"
					required
				/>
			</div>
			<Button type="submit" class="w-full">Start chatting</Button>
		</form>
	</div>
</div>
