<script lang="ts">
    import ClientDB from "@lib/db";
    import { chats } from "@lib/stores";
    import type { Chat, ChatMessage } from "@lib/types";
    import { getUsername, me } from "@lib/users";
    import { TrashBinOutline } from "flowbite-svelte-icons";

    export let msg: ChatMessage;

    let myid = me();
    let cont: HTMLDivElement;

    function getColor(id: string) {
        if (id == myid) return "primary-600";

        let colors = [
            "green",
            "blue",
            "yellow",
            "purple",
            "pink",
            "indigo",
            "gray",
            "orange",
        ];

        // Get a number from the id
        let num = id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
        return colors[num % colors.length];
    }

    async function deleteMessage() {
        let chatsdb = new ClientDB("mqttchat-chats", "topic");
        await chatsdb.wait();
        let chat = (await chatsdb.get(msg.topic)) as Chat;
        if (chat == undefined) return;
        chat.messages = chat.messages.filter((m) => m.id != msg.id);
        await chatsdb.set(chat);
        console.log("Deleted message", msg);
        cont.remove();
    }
</script>

<div
    class="group flex -translate-x-[3rem] flex-row flex-nowrap transition-transform hover:translate-x-0"
    bind:this={cont}
>
    <div
        class:own={msg.sender == myid}
        class="relative inline-block h-full w-[3rem] cursor-pointer [&.own]:bg-primary-600"
        style:background-color={getColor(msg.sender)}
    >
        <TrashBinOutline
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hover:text-red-600"
            on:click={deleteMessage}
        />
    </div>
    <div
        class:own={msg.sender == myid}
        class="inline-block rounded-none border-l-4 border-l-gray-700 bg-transparent p-1 px-2 [&.own]:border-l-primary-600"
        style:border-left-color={getColor(msg.sender)}
    >
        <span class="block text-xs">
            {#await getUsername(msg.sender)}
                {""}
            {:then username}
                {username || ""}
            {/await}
        </span>
        <span class="whitespace-pre-wrap">
            {msg.message}
        </span>
    </div>
</div>
