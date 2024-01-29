import { writable } from "svelte/store";
import type { Chat, ChatMessage } from "./types";

export const chats = writable<Array<Chat>>([]);

export const outbox = writable<Array<ChatMessage>>([]);

export const activeChat = writable<Chat | undefined>(undefined);
