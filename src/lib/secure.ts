import * as openpgp from "openpgp/lightweight";

function getRandomHexString(bytelen: number): string {
    let bytes = crypto.getRandomValues(new Uint8Array(bytelen));
    let hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
    return hex.join("");
}

function getRandomB64String(bytelen: number): string {
    let bytes = crypto.getRandomValues(new Uint8Array(bytelen));
    return window.btoa(String.fromCharCode(...bytes));
}

export class SymmetricSecurity {
    #key: string;

    constructor(key: string) {
        this.#key = key;
    }

    async encrypt(message: string): Promise<string> {
        const msg = await openpgp.createMessage({
            text: message,
        });

        const encrypted = await openpgp.encrypt({
            message: msg,
            passwords: [this.#key],
            format: "armored",
        });
        return encrypted;
    }

    async decrypt(message: string): Promise<string> {
        const msg = await openpgp.readMessage({
            armoredMessage: message,
        });

        const decrypted = await openpgp.decrypt({
            message: msg,
            passwords: [this.#key],
            format: "utf8",
        });

        return decrypted.data;
    }
}

console.log(getRandomHexString(32));
