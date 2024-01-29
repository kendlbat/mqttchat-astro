<script lang="ts">
    import { chats } from "@lib/stores";
    import type { Chat } from "@lib/types";
    import {
        Sidebar,
        SidebarGroup,
        SidebarItem,
        SidebarWrapper,
        Spinner,
    } from "flowbite-svelte";
    import { UserCircleSolid } from "flowbite-svelte-icons";

    export let activeChat = "#obg";

    let chatsMirror: Array<Chat> = [];

    chats.subscribe((value) => {
        chatsMirror = value;
    });
</script>

<Sidebar
    activeUrl={activeChat}
    asideClass="w-16 hover:w-56 transition-width group"
>
    <SidebarWrapper class="h-screen rounded-none overflow-hidden">
        <SidebarGroup>
            {#if chatsMirror.length == 0}
                <SidebarItem
                    href="javascript:void(0);"
                    label="Loading chats..."
                    draggable="false"
                    spanClass="opacity-0 group-hover:opacity-100 -translate-x-6 text-nowrap whitespace-nowrap group-hover:translate-x-0 transition-all"
                >
                    <svelte:fragment slot="icon">
                        <Spinner
                            size="5"
                            class="ml-[0.155rem] group-hover:mr-2 min-h-5 min-w-5 opacity-100 "
                        />
                    </svelte:fragment>
                </SidebarItem>
            {:else}
                {#each chatsMirror as chat}
                    <SidebarItem
                        href={`#${chat.topic}`}
                        label={chat.alias}
                        spanClass="opacity-0 group-hover:opacity-100 -translate-x-6 text-nowrap whitespace-nowrap group-hover:translate-x-0 transition-all"
                    >
                        <svelte:fragment slot="icon">
                            <UserCircleSolid
                                class="w-5 h-5 ml-[0.155rem] group-hover:mr-2"
                            />
                        </svelte:fragment>
                    </SidebarItem>
                {/each}
            {/if}
        </SidebarGroup>
    </SidebarWrapper>
</Sidebar>
