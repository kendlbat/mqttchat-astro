<script lang="ts">
    import ClientDB from "@lib/db";
    import { chats, activeChat, preferences } from "@lib/stores";
    import {
        Sidebar,
        SidebarDropdownItem,
        SidebarDropdownWrapper,
        SidebarGroup,
        SidebarItem,
        SidebarWrapper,
        Spinner,
        Toggle,
    } from "flowbite-svelte";
    import {
        CogOutline,
        MessagesOutline,
        PlusSolid,
    } from "flowbite-svelte-icons";

    export let activeChatHash = window.location.hash || "#general";

    window.addEventListener("hashchange", () => {
        activeChatHash = window.location.hash;
    });
</script>

<Sidebar
    activeUrl={activeChatHash}
    asideClass="relative w-16 hover:w-56 transition-width group"
>
    <SidebarWrapper class="h-screen overflow-hidden rounded-none">
        <SidebarGroup>
            {#if $chats.length == 0}
                <SidebarItem
                    href="javascript:void(0);"
                    label="Loading chats..."
                    draggable="false"
                    spanClass="opacity-0 group-hover:opacity-100 -translate-x-6 text-nowrap whitespace-nowrap group-hover:translate-x-0 transition-all"
                >
                    <svelte:fragment slot="icon">
                        <Spinner
                            size="5"
                            class="ml-[0.155rem] min-h-5 min-w-5 opacity-100 group-hover:mr-2 "
                        />
                    </svelte:fragment>
                </SidebarItem>
            {:else}
                {#each $chats as chat}
                    <SidebarItem
                        href={`#${chat.topic}`}
                        label={chat.alias}
                        spanClass="opacity-0 group-hover:opacity-100 -translate-x-6 text-nowrap whitespace-nowrap group-hover:translate-x-0 transition-all"
                    >
                        <svelte:fragment slot="icon">
                            <MessagesOutline
                                class="ml-[0.155rem] h-5 w-5 group-hover:mr-2"
                            />
                        </svelte:fragment>
                    </SidebarItem>
                {/each}
            {/if}
            <SidebarItem
                href="javascript:void(0);"
                label="Add chat"
                on:click={() => {
                    let alias = prompt("Enter chat alias");
                    let topic = prompt("Enter chat topic");
                    if (topic && topic.match(/^[a-zA-Z0-9]+$/)) {
                        if (!topic) return;
                        if (!alias) alias = topic;
                        chats.update((c) => {
                            c.push({
                                alias: alias || "",
                                messages: [],
                                topic: topic || "",
                            });
                            let cdb = new ClientDB("mqttchat-chats", "topic");
                            cdb.wait().then(() => cdb.set(c));

                            return c;
                        });
                    }
                }}
                spanClass="opacity-0 group-hover:opacity-100 -translate-x-6 text-nowrap whitespace-nowrap group-hover:translate-x-0 transition-all"
            >
                <svelte:fragment slot="icon">
                    <PlusSolid class="ml-[0.155rem] h-5 w-5 group-hover:mr-2" />
                </svelte:fragment>
            </SidebarItem>
            <SidebarDropdownWrapper
                label="Settings"
                spanClass="opacity-0 group-hover:opacity-100 -translate-x-6 text-nowrap whitespace-nowrap group-hover:translate-x-0 transition-all mr-2"
            >
                <svelte:fragment slot="icon">
                    <CogOutline
                        class="ml-[0.155rem] h-5 w-5 group-hover:mr-2"
                    />
                </svelte:fragment>
                <li class="hidden pl-2 group-hover:block">
                    <div
                        class="cursor-pointer text-sm dark:text-white"
                        role="none"
                        on:click={async () => {
                            if ($activeChat == undefined) return;
                            $activeChat.messages = [];
                            let chatsdb = new ClientDB(
                                "mqttchat-chats",
                                "topic",
                            );
                            await chatsdb.wait();
                            await chatsdb.set($activeChat);
                        }}
                    >
                        Clear current chat
                    </div>
                </li>
                <li class="hidden pl-2 pt-1 group-hover:block">
                    <div
                        class="cursor-pointer text-sm dark:text-white"
                        role="none"
                        on:click={async () => {
                            if ($activeChat == undefined) return;
                            if ($activeChat.topic == "general")
                                return alert(
                                    "You can't leave the general chat",
                                );
                            chats.update((c) =>
                                c.filter(
                                    (chat) => chat.topic != $activeChat?.topic,
                                ),
                            );
                            let chatsdb = new ClientDB(
                                "mqttchat-chats",
                                "topic",
                            );
                            await chatsdb.wait();
                            await chatsdb.forget($activeChat.topic);
                            activeChatHash = "#general";
                            $activeChat = $chats.find(
                                (c) => c.topic == "general",
                            );
                        }}
                    >
                        Leave chat
                    </div>
                </li>
                <li class="hidden p-2 group-hover:block">
                    <Toggle
                        bind:checked={$preferences.showImages}
                        class="dark:text-white">Show images</Toggle
                    >
                </li>
            </SidebarDropdownWrapper>
        </SidebarGroup>
    </SidebarWrapper>
</Sidebar>
