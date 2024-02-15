import ClientDB from "./db";

const db = new ClientDB("mqttchat-users");

let cache: Record<string, string> = {};
let cacheme: string | undefined;

export function me() {
    // Load data from indexedDB
    if (cacheme) return cacheme;

    cacheme = localStorage.getItem("mqttchat-selfid") || crypto.randomUUID();
    localStorage.setItem("mqttchat-selfid", cacheme);

    return cacheme;
}

export async function getUsername(id: string) {
    if (cache[id]) return cache[id];

    cache[id] = (await db.get("users", id)) || id;

    return cache[id];
}
