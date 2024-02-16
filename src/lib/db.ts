export default class ClientDB {
    name: string;
    #conn?: IDBDatabase;

    constructor(name: string, keyPath: string = "id") {
        this.name = name;
        let openreq = indexedDB.open(name);

        openreq.onupgradeneeded = (e) => {
            let db = openreq.result;
            if (db.objectStoreNames.contains("data")) {
                db.deleteObjectStore("data");
            }
            db.createObjectStore("data", {
                keyPath,
            });
        };

        openreq.onsuccess = (e) => {
            this.#conn = openreq.result;
        };

        openreq.onerror = (e) => {
            console.error(e);
        };
    }

    async set(value: any): Promise<void> {
        if (this.#conn == undefined) throw new Error("DB not connected");

        let tx = this.#conn.transaction("data", "readwrite");
        let st = tx.objectStore("data");
        st.put(value);
        await new Promise((resolve) => {
            tx.oncomplete = (e) => {
                resolve(e);
            };
        });

        return;
    }

    async forget(key: string): Promise<void> {
        if (this.#conn == undefined) throw new Error("DB not connected");

        let tx = this.#conn.transaction("data", "readwrite");
        let st = tx.objectStore("data");
        st.delete(key);
        await new Promise((resolve) => {
            tx.oncomplete = (e) => {
                resolve(e);
            };
        });

        return;
    }

    async get(key: string): Promise<unknown | undefined> {
        if (this.#conn == undefined) throw new Error("DB not connected");

        let tx = this.#conn.transaction("data", "readonly");
        let st = tx.objectStore("data");
        let req = st.get(key);
        await new Promise((resolve) => {
            tx.oncomplete = (e) => {
                resolve(e);
            };
        });

        return req.result;
    }

    async getAll(): Promise<unknown[]> {
        if (this.#conn == undefined) throw new Error("DB not connected");
        let tx = this.#conn.transaction("data", "readonly");
        let st = tx.objectStore("data");
        let req = st.getAll();
        await new Promise((resolve) => {
            tx.oncomplete = (e) => {
                resolve(e);
            };
        });

        return req.result;
    }
}
