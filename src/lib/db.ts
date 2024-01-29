export default class ClientDB {
    name: string;
    #conn?: IDBDatabase;

    constructor(name: string) {
        this.name = name;
        let openreq = indexedDB.open(name);

        openreq.onupgradeneeded = (e) => {
            let db = openreq.result;
            db.createObjectStore("data", {
                keyPath: "id",
            });
        };

        openreq.onsuccess = (e) => {
            this.#conn = openreq.result;
        };

        openreq.onerror = (e) => {
            console.error(e);
        };
    }

    async set(store: string, key: string, value: string): Promise<void> {
        if (this.#conn == undefined) throw new Error("DB not connected");

        let tx = this.#conn.transaction(store, "readwrite");
        let st = tx.objectStore(store);
        st.put(value, key);
        await new Promise((resolve) => {
            tx.oncomplete = (e) => {
                resolve(e);
            };
        });

        return;
    }

    async forget(store: string, key: string): Promise<void> {
        if (this.#conn == undefined) throw new Error("DB not connected");

        let tx = this.#conn.transaction(store, "readwrite");
        let st = tx.objectStore(store);
        st.delete(key);
        await new Promise((resolve) => {
            tx.oncomplete = (e) => {
                resolve(e);
            };
        });

        return;
    }

    async get(store: string, key: string): Promise<string | undefined> {
        if (this.#conn == undefined) throw new Error("DB not connected");

        let tx = this.#conn.transaction(store, "readonly");
        let st = tx.objectStore(store);
        let req = st.get(key);
        await new Promise((resolve) => {
            tx.oncomplete = (e) => {
                resolve(e);
            };
        });

        return req.result;
    }
}
