<script lang="ts">
    import { chats } from "@lib/stores";
    import {
        Sidebar,
        SidebarGroup,
        SidebarItem,
        SidebarWrapper,
        Spinner,
    } from "flowbite-svelte";
    import { PlusSolid, UserCircleSolid } from "flowbite-svelte-icons";

    export let activeChat = window.location.hash || "#general";

    window.addEventListener("hashchange", () => {
        activeChat = window.location.hash;
    });
</script>

<Sidebar
    activeUrl={activeChat}
    asideClass="w-16 hover:w-56 transition-width group"
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
                            <UserCircleSolid
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
        </SidebarGroup>
    </SidebarWrapper>
</Sidebar>
