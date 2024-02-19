<script lang="ts">
    import ClientDB from "@lib/db";
    import { chats } from "@lib/stores";
    import type { Chat, ChatMessage } from "@lib/types";
    import { getUsername, me } from "@lib/users";
    import { TrashBinOutline } from "flowbite-svelte-icons";

    export let msg: ChatMessage;
    export let showImage: boolean = true;

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
        cont.remove();
        await chatsdb.set({
            ...chat,
            messages: chat.messages.filter((m) => m.id != msg.id),
        });
        console.log("Deleted message", msg);
    }
</script>

<div
    class="group relative flex w-[calc(100%-60px)] flex-row flex-nowrap transition-transform hover:translate-x-0 hover:bg-gray-800"
    bind:this={cont}
>
    <!-- <div
        class:own={msg.sender == myid}
        class="relative inline-block h-full w-[3rem] cursor-pointer [&.own]:bg-primary-600"
        style:background-color={getColor(msg.sender)}
    >
        <TrashBinOutline
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hover:text-red-600"
            on:click={deleteMessage}
        />
    </div> -->
    <div
        class="absolute -top-[18px] right-8 hidden h-9 overflow-hidden rounded bg-gray-700 group-hover:block"
    >
        <ul class="h-9">
            <li class="h-9 w-9 p-1.5 hover:bg-gray-600">
                <TrashBinOutline
                    class="h-6 w-6 cursor-pointer text-red-500"
                    on:click={deleteMessage}
                />
            </li>
        </ul>
    </div>
    <div
        class:own={msg.sender == myid}
        class="inline-block w-full rounded-none border-l-4 border-l-gray-700 bg-transparent p-1 px-2 [&.own]:border-l-primary-600"
        style:border-left-color={getColor(msg.sender)}
    >
        <span class="block text-xs">
            {#await getUsername(msg.sender)}
                {""}
            {:then username}
                {username || ""}
            {/await}
        </span>
        <span class="block max-w-[1000px] break-words">
            {#if msg?.x?.isImage && msg.message.startsWith("data:image/")}
                <span
                    role="none"
                    class="cursor-pointer"
                    on:click={() => {
                        window.open(msg.message);
                    }}
                >
                    {#if showImage}
                        <img
                            src={msg.message}
                            alt="Recieved"
                            class="max-h-[200px] max-w-[200px]"
                        />
                    {:else}
                        <p class="text-gray-400">Image</p>
                    {/if}
                </span>
            {:else}
                {#each msg.message.split("\n") as line}
                    <p>{line}</p>
                {/each}
            {/if}
        </span>
    </div>
</div>
