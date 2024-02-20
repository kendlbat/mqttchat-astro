<script lang="ts">
    import { Button, Textarea } from "flowbite-svelte";
    import { writable } from "svelte/store";
    import { PapperClipSolid, PapperPlaneSolid } from "flowbite-svelte-icons";
    import { activeChat, outbox, replyTo } from "@lib/stores";
    import { me } from "@lib/users";
    import type { ChatMessage } from "@lib/types";
    import type { SvelteComponent } from "svelte";

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
        if ($message == "") return;
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
                reply: $replyTo?.id
                    ? {
                          id: $replyTo.id,
                          sender: $replyTo.sender,
                          message: $replyTo.message,
                          time: $replyTo.time,
                      }
                    : undefined,
            },
        });
        $replyTo = undefined;
    }

    const sendImageDataURL = (dataurl: string) => {
        outbox.set({
            id: crypto.randomUUID(),
            message: dataurl,
            sender: me(),
            time: new Date(),
            topic: $activeChat?.topic || "",
            x: {
                senderNick: localStorage.getItem("mqtt-username") || undefined,
                isImage: true,
                reply: $replyTo?.id
                    ? {
                          id: $replyTo.id,
                          sender: $replyTo.sender,
                          message: $replyTo.message,
                          time: $replyTo.time,
                      }
                    : undefined,
            },
        });
        $replyTo = undefined;
    };

    replyTo.subscribe((e) => {
        e != undefined && document.getElementById("message-input")?.focus();
    });

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
        <div class="ml-4 mt-2 w-1/2 md:w-2/3">
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
                on:paste={(event) => {
                    let items = event.clipboardData?.items;
                    if (items) {
                        for (let item of items) {
                            if (item.kind == "file") {
                                let file = item.getAsFile();
                                if (file) {
                                    let reader = new FileReader();
                                    reader.onload = (e) => {
                                        let result = e.target?.result;
                                        if (typeof result == "string") {
                                            if (
                                                confirm(
                                                    "Are you sure you want to send this image?",
                                                )
                                            )
                                                sendImageDataURL(result);
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }
                        }
                    }
                }}
            />
        </div>
        <div class="ml-4 mt-2 h-14 w-20">
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
        <div class="ml-4 mr-4 mt-2 h-14 w-20">
            <Button
                class="h-full w-full"
                type="button"
                disabled={playingSendingAnimation}
                on:click={() => {
                    // let user upload image
                    let up = document.createElement("input");
                    up.type = "file";
                    up.accept = "image/*";
                    up.onchange = () => {
                        let file = up.files?.item(0);
                        if (file) {
                            let reader = new FileReader();
                            reader.onload = (e) => {
                                let result = e.target?.result;
                                if (typeof result == "string") {
                                    if (
                                        confirm(
                                            "Are you sure you want to send this image?",
                                        )
                                    )
                                        sendImageDataURL(result);
                                }
                            };
                            reader.readAsDataURL(file);
                        }
                        up.remove();
                    };
                    document.body.appendChild(up);
                    let remove = () => {
                        up.remove();
                        document.removeEventListener("click", remove);
                    };
                    document.addEventListener("click", remove);
                    up.click();
                }}
            >
                <span>
                    <PapperClipSolid />
                </span>
            </Button>
        </div>
    </form>
</div>
