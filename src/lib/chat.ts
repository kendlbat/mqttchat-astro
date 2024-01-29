import Mqtt from "@lib/mqtt";
import { SymmetricSecurity } from "./secure";
import { activeChat, chats } from "./stores";
import type { Chat, ChatMessage } from "./types";

async function main() {
    console.log("Mqtt chat client loading...");
    console.log("(c) Tobias Kendlbacher 2024");
    console.log("https://kendlbat.dev/");

    const mqtt = Mqtt.fromStored();

    if (mqtt == undefined) {
        window.location.href = "/login";
        return;
    }

    mqtt.waitUntilConnected().then(() => {
        let testChat: Chat = {
            alias: "testChat",
            messages: [
                {
                    message: "test",
                    time: new Date(),
                    topic: "testTopic",
                    id: crypto.randomUUID(),
                    sender: "testUser",
                },
            ],
            topic: "testTopic",
        };
        chats.set([testChat]);

        activeChat.set(testChat);

        mqtt.subscribe("chat/#", (t, m) => {
            console.log(t, m);
        });
        mqtt.subscribe(
            mqtt.MGMTPREFIX + "user/" + mqtt.username + "/#",
            (t, m) => {
                let subt = new RegExp(
                    `^${mqtt.MGMTPREFIX}user/${mqtt.username}/(.*)$`
                ).exec(t);
                if (subt == null) return;
                let subtopic = subt[1];
                switch (subtopic) {
                    case "keyexchange":
                        // TODO: Verify Key
                        break;
                    case "status":
                }
            }
        );
    });

    let stest = new SymmetricSecurity("testKey");
    console.log(await stest.encrypt("test"));
    console.log(await stest.decrypt(await stest.encrypt("test")));
}

main();
