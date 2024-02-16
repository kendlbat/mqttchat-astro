import { writable } from "svelte/store";
import type { ChatMessage, Chat } from "./types";

export const chats = writable<Array<Chat>>([]);

export const activeChat = writable<Chat | undefined>(undefined);

export const outbox = writable<ChatMessage | undefined>(undefined);
