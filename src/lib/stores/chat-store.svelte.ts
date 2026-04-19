import type { ChatSummary } from '$lib/types';

class ChatStore {
	chats = $state<ChatSummary[]>([]);
	currentChatId = $state<string | null>(null);

	get currentChat(): ChatSummary | null {
		return this.chats.find((c) => c.id === this.currentChatId) ?? null;
	}

	setChats(chats: ChatSummary[]) {
		this.chats = chats;
	}

	addChat(chat: ChatSummary) {
		this.chats = [chat, ...this.chats];
	}

	removeChat(id: string) {
		this.chats = this.chats.filter((c) => c.id !== id);
	}

	setCurrentChatId(id: string | null) {
		this.currentChatId = id;
	}
}

export const chatStore = new ChatStore();
