import ClientDB from "./db";

const db = new ClientDB("mqttchat-users");
await db.wait();

let cache: Record<string, string | undefined> = {};
let cacheme: string | undefined;

export function me() {
    // Load data from indexedDB
    if (cacheme) return cacheme;

    cacheme = localStorage.getItem("mqttchat-selfid") || crypto.randomUUID();
    localStorage.setItem("mqttchat-selfid", cacheme);

    return cacheme;
}

export async function getUsername(id: string): Promise<string | undefined> {
    if (cache[id]) return cache[id];
    if (id === me()) return "You";

    cache[id] = ((await db.get(id)) as { id: string; name: string })?.name;

    return cache[id];
}

export async function setUsername(id: string, name: string) {
    cache[id] = name;
    await db.set({ id, name });
}
