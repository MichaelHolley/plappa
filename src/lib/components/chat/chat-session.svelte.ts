import { chatStore } from '$lib/stores/chat-store.svelte.js';
import type { VocabEntry } from '$lib/types';
import { Chat } from '@ai-sdk/svelte';
import { DefaultChatTransport, isToolUIPart } from 'ai';
import { SvelteSet } from 'svelte/reactivity';

interface ChatSessionData {
	id: string;
	messages: Chat['messages'];
	vocabulary?: VocabEntry[];
}

/**
 * Page-scoped controller for a single chat. Owns the AI SDK `Chat` instance,
 * vocabulary state and the tool-call processing plumbing so the page component
 * stays purely presentational. Instantiated per chat (re-created on navigation),
 * not a global singleton.
 */
export class ChatSession {
	readonly id: string;
	readonly chat: Chat;

	vocabulary = $state<VocabEntry[]>([]);
	#processedToolCallIds = new SvelteSet<string>();

	isResponding: boolean;
	showTypingIndicator: boolean;

	constructor(data: ChatSessionData) {
		this.id = data.id;
		this.vocabulary = data.vocabulary ?? [];

		this.chat = new Chat({
			id: data.id,
			messages: data.messages,
			transport: new DefaultChatTransport({
				api: '/api/chat',
				prepareSendMessagesRequest({ messages, id }) {
					return { body: { message: messages[messages.length - 1], id } };
				}
			})
		});

		this.isResponding = $derived(
			this.chat.status === 'submitted' || this.chat.status === 'streaming'
		);

		// Show the typing indicator after sending and until the first assistant token arrives.
		this.showTypingIndicator = $derived.by(() => {
			if (!this.isResponding) return false;
			const last = this.chat.messages[this.chat.messages.length - 1];
			if (last?.role !== 'assistant') return true;
			return !(last.parts ?? []).some(
				(part) => part.type === 'text' && part.text.trim().length > 0
			);
		});

		// Seed already-processed tool calls from the persisted history.
		for (const msg of data.messages) {
			if (msg.role !== 'assistant') continue;
			for (const part of msg.parts ?? []) {
				if (isToolUIPart(part)) {
					this.#processedToolCallIds.add(part.toolCallId);
				}
			}
		}
	}

	send(text: string) {
		if (this.isResponding) return;
		this.chat.sendMessage({ text });
	}

	stop() {
		this.chat.stop();
	}

	/**
	 * Apply side effects from newly-completed assistant tool calls. Idempotent:
	 * each tool call is processed at most once. Call from a `$effect` in the page.
	 */
	processToolCalls() {
		for (const message of this.chat.messages) {
			if (message.role !== 'assistant') continue;
			for (const part of message.parts ?? []) {
				// AI SDK v6: tool parts have type `tool-${name}`, flat toolCallId/state/output
				if (!isToolUIPart(part)) continue;
				const toolCallId = part.toolCallId;
				const state = (part as { state: string }).state;
				if (state !== 'output-available' || this.#processedToolCallIds.has(toolCallId)) continue;

				if (part.type === 'tool-addVocabulary') {
					this.#processedToolCallIds.add(toolCallId);
					const output = (part as { output?: { added: VocabEntry[] } }).output;
					if (output?.added?.length) {
						this.vocabulary = [...this.vocabulary, ...output.added];
					}
				} else if (part.type === 'tool-updateChatTitle') {
					this.#processedToolCallIds.add(toolCallId);
					const output = (part as { output?: { title: string } }).output;
					if (output?.title) {
						chatStore.updateChatTitle(this.id, output.title);
					}
				}
			}
		}
	}
}
