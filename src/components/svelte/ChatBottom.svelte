<script lang="ts">
    import { Button, Input } from "flowbite-svelte";
    import { writable } from "svelte/store";
    import { PapperPlaneSolid } from "flowbite-svelte-icons";

    let message = writable<string>("");

    let playingSendingAnimation: boolean = false;

    async function playSendingAnimation() {
        playingSendingAnimation = true;
        setTimeout(() => {
            playingSendingAnimation = false;
        }, 500);
    }
</script>

<div class="bg-slate-700 h-20">
    <form
        on:submit={() => {
            alert($message);
        }}
        action="javascript:void(0);"
        class="h-full w-full flex flex-row flex-nowrap"
    >
        <div class="h-12 mt-4 ml-4 w-2/3 max-w-[280px]">
            <Input bind:value={$message} />
        </div>
        <div class="h-12 mt-4 ml-4 w-20">
            <Button class="w-full" on:click={playSendingAnimation}>
                <PapperPlaneSolid
                    class={"transition-opacity" +
                        (playingSendingAnimation
                            ? " transition-all -translate-y-[1000%] opacity-0"
                            : "")}
                />
            </Button>
        </div>
    </form>
</div>
