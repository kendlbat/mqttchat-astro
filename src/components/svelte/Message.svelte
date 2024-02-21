<script lang="ts">
    import ClientDB from "@lib/db";
    import { AsymmetricSecurity } from "@lib/secure";
    import { chats, replyTo, activeChat } from "@lib/stores";
    import type { Chat, ChatMessage } from "@lib/types";
    import { getUsername, me } from "@lib/users";
    import {
        ReplyOutline,
        ReplySolid,
        TrashBinOutline,
    } from "flowbite-svelte-icons";

    export let msg: ChatMessage;
    export let showImage: boolean = true;

    let myid = me();
    let cont: HTMLDivElement;

    function hhmmdmstring(date: Date) {
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} ${date.getDate().toString()}.${(date.getMonth() + 1).toString()}.`;
    }

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

    function dataUrlToBlobUrl(durl: string): string {
        let bytes = atob(plainMessage.split(",")[1]);
        let byteNumbers = new Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            byteNumbers[i] = bytes.charCodeAt(i);
        }

        let blob = new Blob([new Uint8Array(byteNumbers)], {
            type: plainMessage.split(",")[0].split(":")[1].split(";")[0],
        });
        let url = URL.createObjectURL(blob);
        return url;
    }

    let imageDataurl: string | undefined = undefined;
    let plainMessage = msg.message;

    if (
        $activeChat?.encrypted !== undefined &&
        msg.sender != me() &&
        msg.x?.pubkey != "store"
    ) {
        plainMessage = "Encrypted message";
        console.log("Their Public Key", $activeChat.encrypted.them.pubkey);
        console.log("My Public Key", $activeChat.encrypted.me.pubkey);
        console.log("Private Key", $activeChat.encrypted.me.privkey);
        (async () => {
            if (!$activeChat.encrypted || !msg.x?.pubkey) return;
            let sec = new AsymmetricSecurity($activeChat.encrypted.me.privkey);
            plainMessage =
                (await sec.decrypt(msg.message, msg.x.pubkey))?.message ||
                "Error decrypting message.";
            imageDataurl = dataUrlToBlobUrl(plainMessage);
        })();
    }

    if (msg?.x?.isImage && plainMessage.startsWith("data:image/"))
        imageDataurl = dataUrlToBlobUrl(plainMessage);
</script>

<div
    id={`msg-${msg.id}`}
    class={`group relative flex w-[calc(100%-60px)] flex-row flex-nowrap transition-transform hover:translate-x-0 hover:bg-gray-800${$replyTo?.id == msg.id ? " bg-gray-800" : ""}`}
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
        <ul class="flex h-9 flex-row flex-nowrap">
            <li
                class="h-9 w-9 p-1.5 hover:bg-gray-600"
                role="none"
                on:click={(e) => {
                    if ($replyTo?.id == msg.id) $replyTo = undefined;
                    else replyTo.set(msg);
                }}
            >
                <ReplyOutline class="h-6 w-6 cursor-pointer" />
            </li>
            <li
                class="h-9 w-9 p-1.5 hover:bg-gray-600"
                role="none"
                on:click={deleteMessage}
            >
                <TrashBinOutline class="h-6 w-6 cursor-pointer text-red-500" />
            </li>
        </ul>
    </div>
    <div
        class:own={msg.sender == myid}
        class="inline-block w-full rounded-none border-l-4 border-l-gray-700 bg-transparent p-1 px-2 [&.own]:border-l-primary-600"
        style:border-left-color={getColor(msg.sender)}
    >
        {#if msg.x?.reply?.id}
            <div
                class="inline-block cursor-pointer pb-1 pr-2 hover:font-bold"
                role="none"
                on:click={() => {
                    // Scroll to the message
                    if (msg?.x?.reply?.id == undefined) return;
                    let el = document.getElementById(`msg-${msg.x.reply.id}`);
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                        // Mark background for 2 seconds
                        el.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        setTimeout(() => {
                            if (el) el.style.backgroundColor = "";
                        }, 2000);
                    }
                }}
            >
                <span
                    class="flex flex-row flex-nowrap gap-2 text-xs text-gray-400"
                >
                    <span class="mt-[1px]">
                        <ReplySolid class="h-3 w-3" />
                    </span>
                    <span class="italic">
                        {hhmmdmstring(new Date(msg.x.reply.time))}
                        {" - "}
                        {#if msg.x.reply.sender == myid}
                            You
                        {:else}
                            {#await getUsername(msg.x.reply.sender)}
                                {""}
                            {:then username}
                                {username || ""}
                            {/await}
                        {/if}
                        {" - "}
                        {#if msg.x.reply.message.match(/^data\:image\/.*/)}
                            Image
                        {:else}
                            {msg.x.reply.message.slice(0, 40) +
                                (msg.x.reply.message.length > 40 ? "..." : "")}
                        {/if}
                    </span>
                </span>
            </div>
        {/if}
        <span class="block text-xs" title={new Date(msg.time).toDateString()}>
            {`${hhmmdmstring(new Date(msg.time))} - `}
            {#await getUsername(msg.sender)}
                {""}
            {:then username}
                {username || ""}
            {/await}
        </span>
        <span class="block max-w-[1000px] break-words">
            {#if msg?.x?.isImage}
                <span
                    role="none"
                    class="cursor-pointer"
                    on:click={() => {
                        if (imageDataurl)
                            window.open(imageDataurl || plainMessage, "_blank");
                    }}
                >
                    {#if !plainMessage.startsWith("data:image/")}
                        <p class="text-gray-400">Error loading image.</p>
                    {:else if showImage}
                        <img
                            src={imageDataurl || plainMessage}
                            alt="Recieved"
                            class="max-h-[200px] max-w-[min(600px,100%)] rounded-lg"
                        />
                    {:else}
                        <p class="text-gray-400">Image</p>
                    {/if}
                </span>
            {:else}
                {#each plainMessage.split("\n") as line}
                    <p>{line}</p>
                {/each}
            {/if}
        </span>
    </div>
</div>
