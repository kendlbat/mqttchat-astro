import ClientDB from "./db";

const db = new ClientDB("mqttchat-users");

let cache: Record<string, string> = {};
let cacheme: string | undefined;

export async function me() {
    // Load data from indexedDB
    if (cacheme) return cacheme;

    cacheme = (await db.get("users", "me")) || crypto.randomUUID();

    return cacheme;
}

export async function getUsername(id: string) {
    if (cache[id]) return cache[id];

    cache[id] = (await db.get("users", id)) || id;

    return cache[id];
}
