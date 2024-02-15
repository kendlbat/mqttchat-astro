import { writable } from "svelte/store";
import type { Chat } from "./types";

export const chats = writable<Array<Chat>>([]);

export const activeChat = writable<Chat | undefined>(undefined);
