export interface Chat {
    topic: string;
    alias: string;
    messages: Array<ChatMessage>;
    encrypted?: {
        me: {
            privkey: string;
            pubkey: string;
        };
        them: {
            pubkey: string;
        };
    };
}

export interface ChatMessage {
    topic: string;
    message: string;
    time: Date;
    id: string;
    sender: string;
    x?: Partial<{
        senderNick: string;
        isImage: boolean;
        pubkey: string;
        reply: {
            id: string;
            message: string;
            sender: string;
            time: Date;
        };
    }>;
}

export interface Preferences {
    showImages: boolean;
}
