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

export class AsymmetricSecurity {
    static async generateKeyPair(username: string): Promise<{
        privkey: string;
        pubkey: string;
    }> {
        const { privateKey, publicKey } = await openpgp.generateKey({
            type: "ecc",
            curve: "curve25519",
            userIDs: [
                { name: username, email: `${username}@chat.kendlbat.dev` },
            ],
            format: "armored",
        });

        return {
            privkey: privateKey,
            pubkey: publicKey,
        };
    }

    #privateKey: string;

    constructor(privateKey: string) {
        this.#privateKey = privateKey;
    }

    async encrypt(message: string, encryptionKey: string): Promise<string> {
        const msg = await openpgp.createMessage({
            text: message,
        });

        const encrypted = await openpgp.encrypt({
            message: msg,
            encryptionKeys: await openpgp.readKey({
                armoredKey: encryptionKey,
            }),
            signingKeys: await openpgp.readPrivateKey({
                armoredKey: this.#privateKey,
            }),
            format: "armored",
        });
        return encrypted;
    }

    async decrypt(
        message: string,
        encryptionKey: string,
    ): Promise<{
        message: string;
    }> {
        const msg = await openpgp.readMessage({
            armoredMessage: message,
        });

        const { data: decrypted, signatures } = await openpgp.decrypt({
            message: msg,
            verificationKeys: await openpgp.readKey({
                armoredKey: encryptionKey,
            }),
            decryptionKeys: await openpgp.readPrivateKey({
                armoredKey: this.#privateKey,
            }),
        });

        await signatures[0].verified;

        return {
            message: decrypted,
        };
    }
}
