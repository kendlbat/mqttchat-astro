<script lang="ts">
    import Message from "./Message.svelte";
    import type { Chat, ChatMessage } from "@lib/types";

    import { activeChat } from "@lib/stores";
    import { getUsername, me, setUsername } from "@lib/users";
    import ChatBottom from "./ChatBottom.svelte";

    import Mqtt from "@lib/mqtt";
    import ClientDB from "@lib/db";
    import { outbox, chats } from "@lib/stores";
    import { SymmetricSecurity } from "@lib/secure";
    import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
    import { DotsVerticalOutline } from "flowbite-svelte-icons";

    async function main() {
        console.log("Mqtt chat client loading...");
        console.log("(c) Tobias Kendlbacher 2024");
        console.log("https://kendlbat.dev/");

        const mqtt = Mqtt.fromStored();

        if (mqtt == undefined) {
            window.location.href = "/login";
            return;
        }

        let chatsdb = new ClientDB("mqttchat-chats", "topic");
        await chatsdb.wait();

        mqtt.waitUntilConnected().then(async () => {
            let generalChat: Chat = {
                alias: "General",
                messages: [
                    // {
                    //     message: "test",
                    //     time: new Date(),
                    //     topic: "testTopic",
                    //     id: crypto.randomUUID(),
                    //     sender: "testUser",
                    // },
                ],
                topic: "general",
            };

            let allChats = (await chatsdb.getAll()) as Chat[];

            if (allChats.length == 0) {
                allChats.push(generalChat);
                await chatsdb.set(generalChat);
            }

            chats.set(allChats);

            // Check window hash
            let hash = window.location.hash;
            if (hash != "") {
                let chat = allChats.find((c) => c.topic == hash.slice(1));
                if (chat != undefined) activeChat.set(chat);
            } else activeChat.set(allChats[0]);

            window.onhashchange = () => {
                let hash = window.location.hash;
                if (hash != "") {
                    let chat = allChats.find((c) => c.topic == hash.slice(1));
                    if (chat != undefined) activeChat.set(chat);
                }
            };

            for (let chat of $chats) {
                mqtt.subscribe("chat/" + chat.topic, async (t, m) => {
                    let msg = JSON.parse(m) as ChatMessage;
                    if (chat.messages?.find((m) => m.id == msg.id) != undefined)
                        return;
                    if (msg.x?.senderNick != undefined) {
                        if ((await getUsername(msg.sender)) == undefined) {
                            setUsername(msg.sender, msg.x.senderNick);
                        }
                    }
                    chat.messages.push(msg);
                    chatsdb.set(chat);
                    // Check if chat is active
                    if ($activeChat?.topic == chat.topic) $activeChat = chat;

                    console.log("Received message", msg);
                });
            }

            if (getUsername(mqtt.username) == undefined) {
                setUsername(mqtt.username, mqtt.username);
            }

            let subscribed = $chats.map((c) => c.topic);
            chats.subscribe((c) => {
                for (let chat of c) {
                    if (!subscribed.includes(chat.topic)) {
                        mqtt.subscribe("chat/" + chat.topic, async (t, m) => {
                            let msg = JSON.parse(m) as ChatMessage;
                            if (
                                chat.messages?.find((m) => m.id == msg.id) !=
                                undefined
                            )
                                return;
                            if (msg.x?.senderNick != undefined) {
                                if (
                                    (await getUsername(msg.sender)) == undefined
                                ) {
                                    setUsername(msg.sender, msg.x.senderNick);
                                }
                            }
                            chat.messages.push(msg);
                            chatsdb.set(chat);
                            // Check if chat is active
                            if ($activeChat?.topic == chat.topic)
                                $activeChat = chat;

                            console.log("Received message", msg);
                        });
                    }
                }
            });

            mqtt.subscribe(
                mqtt.MGMTPREFIX + "user/" + mqtt.username + "/#",
                (t, m) => {
                    let subt = new RegExp(
                        `^${mqtt.MGMTPREFIX}user/${mqtt.username}/(.*)$`,
                    ).exec(t);
                    if (subt == null) return;
                    let subtopic = subt[1];
                    switch (subtopic) {
                        case "keyexchange":
                            // TODO: Verify Key
                            break;
                        case "status":
                    }
                },
            );
            outbox.subscribe((m) => {
                if (m == undefined) return;
                mqtt.publish("chat/" + m.topic, JSON.stringify(m), {
                    qos: 2,
                    retain: false,
                });
                outbox.set(undefined);

                if ($activeChat == undefined) return;
                if ($activeChat.messages?.includes(m)) return;
                $activeChat.messages.push(m);
                $activeChat = $activeChat;

                chatsdb.set($activeChat);
                console.log("Sent message", m);
            });
        });

        // let stest = new SymmetricSecurity("testKey");
        // console.log(await stest.encrypt("test"));
        // console.log(await stest.decrypt(await stest.encrypt("test")));
    }

    main();

    let dropdownOpen = false;
</script>

<div
    class="relative float-right flex h-dvh w-full flex-col flex-nowrap text-white"
>
    <!-- Header -->
    <div class="relative h-16 w-full bg-gray-50 dark:bg-gray-800">
        <h1 class="absolute top-1/2 -translate-y-1/2 pl-4 text-2xl">
            {#if $activeChat}
                {$activeChat.alias}
            {:else}
                Select a chat
            {/if}
        </h1>
        <Button class="float-right mb-2 mr-2 mt-2 h-10" color="none">
            <DotsVerticalOutline />
        </Button>
        <Dropdown
            class="overflow-y-auto"
            bind:open={dropdownOpen}
            containerClass="rounded-none"
        >
            <DropdownItem
                on:click={async () => {
                    dropdownOpen = false;
                    if ($activeChat == undefined) return;
                    $activeChat.messages = [];
                    let chatsdb = new ClientDB("mqttchat-chats", "topic");
                    await chatsdb.wait();
                    await chatsdb.set($activeChat);
                }}>Clear history</DropdownItem
            >
        </Dropdown>
    </div>

    <!-- Conversation -->
    <div class="flex h-full flex-col-reverse overflow-y-auto">
        <div class="flex flex-col flex-nowrap gap-1 py-2 text-lg">
            {#if $activeChat}
                {#each $activeChat.messages as msg}
                    <Message {msg} />
                {/each}
            {/if}
        </div>
    </div>

    <!-- Send Box -->
    <ChatBottom />
</div>
