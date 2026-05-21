<script lang="ts">
	interface Props {
		language: string;
	}

	let { language }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
	<p class="text-2xl font-semibold">Start learning {language}</p>
	<p class="max-w-sm text-sm text-muted-foreground">
		Say anything — introduce yourself, ask a question, or try a sentence in {language}. Your tutor
		will reply, correct mistakes, and explain grammar as you go.
	</p>
	<ul class="mt-2 space-y-1 text-left text-sm text-muted-foreground">
		<li>💬 Write in {language} — mistakes get corrected naturally in context</li>
		<li>📊 Share your level so the tutor adjusts how much {language} vs English to use</li>
		<li>❓ Ask for translations or grammar explanations in your native language</li>
		<li>🎭 Ask to role-play a scenario — ordering food, job interviews, small talk</li>
		<li>📚 New words get saved to your vocabulary list automatically</li>
	</ul>
</div>
