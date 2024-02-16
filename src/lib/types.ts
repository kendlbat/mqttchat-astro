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
    }>;
}
