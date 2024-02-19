import mqtt from "mqtt";

export default class Mqtt {
    #broker: string;
    #username: string;
    #password: string | undefined;

    // Prefixes for avoiding collisions with other clients on the same broker
    CHATPREFIX: string = "chat/";
    MGMTPREFIX: string = "eo6CheeleeMi/management/";

    #waitingForConnect: Array<() => any> = [];

    #client?: mqtt.MqttClient;

    constructor(broker: string, username: string, password?: string) {
        this.#broker = broker;
        this.#username = username;
        this.#password = password;

        let opts: { username?: string; password?: string } = {};

        if (this.#password) {
            opts.username = this.#username;
            opts.password = this.#password;
        }

        console.log("connecting");
        mqtt.connectAsync(broker, {
            ...opts,
            clientId: crypto.randomUUID(),
        }).then((client) => {
            this.#client = client;
            console.log("connected");
            this.storeCreds();
            this.#waitingForConnect.forEach((p) => p());
            this.#waitingForConnect = [];
        });
    }

    subscribe(
        topic: string,
        callback: (
            topic: string,
            message: string,
            packet: mqtt.IPublishPacket,
        ) => void,
    ) {
        if (!this.#client?.connected) throw new Error("not connected");

        this.#client?.subscribe(topic);
        this.#client?.on("message", (t, m, p) => {
            callback(t, m.toString(), p);
        });
    }

    publish(topic: string, message: string, opts?: mqtt.IClientPublishOptions) {
        if (!this.#client?.connected) throw new Error("not connected");
        this.#client?.publish(topic, message, opts);
    }

    unsubscribe(topic: string) {
        if (!this.#client?.connected) throw new Error("not connected");
        this.#client?.unsubscribe(topic);
    }

    waitUntilConnected(timeoutMillis?: number): Promise<void> {
        if (this.#client?.connected) {
            return Promise.resolve();
        }

        const promise = new Promise<void>((resolve, reject) => {
            let timeout: any;
            if (timeoutMillis !== undefined) {
                timeout = setTimeout(() => {
                    reject(new Error("timeout"));
                }, timeoutMillis);
            }

            this.#waitingForConnect.push(() => {
                if (timeout) clearTimeout(timeout);
                resolve();
            });
        });

        return promise;
    }

    storeCreds() {
        localStorage.setItem("mqtt-broker", this.#broker);
        localStorage.setItem("mqtt-username", this.#username);
        localStorage.setItem("mqtt-password", this.#password || "");
    }

    static fromStored() {
        const broker = localStorage.getItem("mqtt-broker");
        const username = localStorage.getItem("mqtt-username");
        const password = localStorage.getItem("mqtt-password") || undefined;

        if (broker && username) {
            return new Mqtt(broker, username, password);
        }
        return undefined;
    }

    static clearCreds() {
        localStorage.removeItem("mqtt-broker");
        localStorage.removeItem("mqtt-username");
        localStorage.removeItem("mqtt-password");
    }

    disconnect() {
        this.#client?.end();
    }

    get connected() {
        return this.#client?.connected;
    }

    get username() {
        return this.#username;
    }

    get broker() {
        return this.#broker;
    }
}
