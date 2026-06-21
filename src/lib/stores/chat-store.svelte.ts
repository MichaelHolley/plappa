import type { ChatSummary } from '$lib/types';

class ChatStore {
	chats = $state<ChatSummary[]>([]);
	archivedChats = $state<ChatSummary[]>([]);
	currentChatId = $state<string | null>(null);

	get currentChat(): ChatSummary | null {
		return this.chats.find((c) => c.id === this.currentChatId) ?? null;
	}

	setChats(chats: ChatSummary[]) {
		this.chats = chats;
	}

	setArchivedChats(chats: ChatSummary[]) {
		this.archivedChats = chats;
	}

	addChat(chat: ChatSummary) {
		this.chats = [chat, ...this.chats];
	}

	removeChat(id: string) {
		this.chats = this.chats.filter((c) => c.id !== id);
	}

	updateChatTitle(id: string, title: string) {
		this.chats = this.chats.map((c) => (c.id === id ? { ...c, title } : c));
		this.archivedChats = this.archivedChats.map((c) => (c.id === id ? { ...c, title } : c));
	}

	setCurrentChatId(id: string | null) {
		this.currentChatId = id;
	}
}

export const chatStore = new ChatStore();
