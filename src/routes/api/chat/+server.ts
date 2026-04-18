import { convertToModelMessages, streamText, type UIMessage } from 'ai';

import { OPENROUTER_API_KEY, OPENROUTER_MODEL_NAME } from '$env/static/private';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { SystemPrompt } from './system-prompt';

const openrouter = createOpenRouter({
	apiKey: OPENROUTER_API_KEY
});

export async function POST({ request }) {
	const { messages }: { messages: UIMessage[] } = await request.json();

	const result = streamText({
		model: openrouter.chat(OPENROUTER_MODEL_NAME),
		system: SystemPrompt,
		messages: await convertToModelMessages(messages)
	});

	return result.toUIMessageStreamResponse();
}
