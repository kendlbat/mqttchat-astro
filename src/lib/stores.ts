import { writable } from "svelte/store";
import type { ChatMessage, Chat, Preferences } from "./types";

export const chats = writable<Array<Chat>>([]);

export const activeChat = writable<Chat | undefined>(undefined);

export const outbox = writable<ChatMessage | undefined>(undefined);

export const replyTo = writable<ChatMessage | undefined>(undefined);

export const preferences = writable<Preferences>({
    showImages: localStorage.getItem("mqttchat-showImages") != "false",
});
