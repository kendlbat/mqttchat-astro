<script lang="ts">
    import Message from "./Message.svelte";
    import type { Chat, ChatMessage } from "@lib/types";

    import { activeChat, preferences, replyTo } from "@lib/stores";
    import { getUsername, me, setUsername } from "@lib/users";
    import ChatBottom from "./ChatBottom.svelte";

    import Mqtt from "@lib/mqtt";
    import ClientDB from "@lib/db";
    import { outbox, chats } from "@lib/stores";
    import { SymmetricSecurity } from "@lib/secure";
    import { Button, Dropdown, DropdownItem, Toggle } from "flowbite-svelte";
    import { DotsVerticalOutline } from "flowbite-svelte-icons";

    async function main() {
        console.log("Mqtt chat client loading...");
        console.log("(c) Tobias Kendlbacher 2024");
        console.log("https://kendlbat.dev/");

        console.warn(`
                              
 .d8888b.  888                       888    
d88P  Y88b 888                       888    
Y88b.      888                       888    This is a browser feature intended for 
 "Y888b.   888888  .d88b.  88888b.   888    developers. If someone told you to copy-paste 
    "Y88b. 888    d88""88b 888 "88b  888    something here to enable a "hidden"
      "888 888    888  888 888  888  Y8P    feature or "hack" someone's account, 
Y88b  d88P Y88b.  Y88..88P 888 d88P         it is a scam and will give them access 
 "Y8888P"   "Y888  "Y88P"  88888P"   888    to your encrypted messages and contacts.
                           888              
                           888              
                           888            `);

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
                else {
                    // Create a new chat
                    let alias = prompt("Enter chat alias");
                    if (alias) {
                        let topic = hash.slice(1);
                        chats.update((c) => {
                            if (!alias) return c;
                            c.push({ alias, messages: [], topic });
                            chatsdb.set({ alias, messages: [], topic });
                            $activeChat = c.find((c) => c.topic == topic);
                            return c;
                        });
                    }
                }
            } else {
                activeChat.set(allChats.find((c) => c.topic == "general"));
                window.location.hash = "#general";
            }
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
                if (m.topic != $activeChat.topic) return;
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

    $: localStorage.setItem(
        "mqttchat-showImages",
        $preferences.showImages ? "true" : "false",
    );

    window.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key == "Escape") {
            $replyTo = undefined;
        }
    });
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
    </div>

    <!-- Conversation -->
    <div class="flex h-full flex-col-reverse overflow-y-auto">
        <div class="flex max-w-full flex-col flex-nowrap gap-1 py-2 text-lg">
            {#if $activeChat}
                {#each $activeChat.messages.filter((msg) => msg.topic == $activeChat?.topic) as msg}
                    <Message {msg} showImage={$preferences.showImages} />
                {/each}
                {#if !$activeChat.messages.find((msg) => msg.topic == $activeChat?.topic)}
                    <div class="p-6">
                        <p class="font-bold">
                            Welcome to <span>"{$activeChat.topic}"</span>!
                        </p>
                        <p>
                            It appears that this channel is empty.<br />Start
                            your epic conversation by typing in the box below!
                        </p>
                    </div>
                {/if}
            {/if}
        </div>
    </div>

    <!-- Send Box -->
    <ChatBottom />
</div>
