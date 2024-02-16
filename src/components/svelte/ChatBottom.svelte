<script lang="ts">
    import { Button, Textarea } from "flowbite-svelte";
    import { writable } from "svelte/store";
    import { PapperPlaneSolid } from "flowbite-svelte-icons";
    import { activeChat, outbox } from "@lib/stores";
    import { me } from "@lib/users";
    import type { ChatMessage } from "@lib/types";

    let message = writable<string>("");

    let playingSendingAnimation: boolean = false;

    async function playSendingAnimation() {
        let input = document.querySelector("input#message-input");
        if (input && input instanceof HTMLInputElement) input.disabled = true;
        playingSendingAnimation = true;
        setTimeout(() => {
            playingSendingAnimation = false;
            if (input && input instanceof HTMLInputElement) {
                // Set focus to input
                input.disabled = false;
                input.focus();
            }
        }, 500);
    }

    function submit() {
        playSendingAnimation();
        // alert($message);
        outbox.set({
            id: crypto.randomUUID(),
            message: $message,
            sender: me(),
            time: new Date(),
            topic: $activeChat?.topic || "",
            x: {
                senderNick: localStorage.getItem("mqtt-username") || undefined,
            },
        });
    }

    outbox.subscribe((m: ChatMessage | undefined) => {
        if (m) message.set("");
    });
</script>

<div class="h-20 bg-slate-700">
    <form
        on:submit={submit}
        action="javascript:void(0);"
        class="flex h-full w-full flex-row flex-nowrap"
    >
        <div class="ml-4 mt-2 w-2/3 max-w-[280px]">
            <Textarea
                id="message-input"
                class="h-14 resize-none"
                bind:value={$message}
                on:keydown={(event) => {
                    // If enter, send
                    if (event.key == "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        submit();
                    }
                }}
            />
        </div>
        <div class="ml-4 mr-4 mt-2 h-14 w-20">
            <Button
                class="h-full w-full"
                type="submit"
                disabled={playingSendingAnimation}
            >
                <span
                    class={playingSendingAnimation
                        ? "scale-x-0 transition-transform duration-500"
                        : "scale-x-100 transition-transform duration-300"}
                >
                    <PapperPlaneSolid
                        class={playingSendingAnimation
                            ? "-translate-y-[1000%] opacity-0 transition-all"
                            : "transition-none"}
                    />
                </span>
            </Button>
        </div>
    </form>
</div>
