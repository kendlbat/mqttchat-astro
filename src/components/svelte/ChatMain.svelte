<script lang="ts">
    import Message from "./Message.svelte";
    import type { Chat } from "@lib/types";

    import { activeChat as activeChatStore } from "@lib/stores";

    let activeChat: Chat | undefined = undefined;

    activeChatStore.subscribe((value) => {
        activeChat = value;
    });
</script>

<div class="float-right text-white relative w-full flex flex-col flex-nowrap">
    <!-- Header -->
    <div class="bg-gray-50 dark:bg-gray-800 w-full h-16 relative">
        <h1 class="text-2xl absolute top-1/2 -translate-y-1/2 pl-4">
            {#if activeChat}
                {activeChat.alias}
            {:else}
                Select a chat
            {/if}
        </h1>
    </div>

    <!-- Conversation -->
    <div
        class="flex flex-col flex-nowrap gap-1 p-2 max-w-[600px] text-lg h-full"
    >
        <Message
            msg={{
                id: "1",
                message: "Hello, World!",
                sender: crypto.randomUUID(),
                topic: "obg",
                time: new Date(),
            }}
        />
        <!-- <Message text="Hello, Peoples!" own /> -->
    </div>

    <!-- Send Box -->
    <div class="bg-white h-20"></div>
</div>
