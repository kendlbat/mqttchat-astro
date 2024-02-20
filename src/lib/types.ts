export interface Chat {
    topic: string;
    alias: string;
    messages: Array<ChatMessage>;
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
