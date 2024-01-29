<script lang="ts">
    import type { ChatMessage } from "@lib/types";
    import { me } from "@lib/users";

    let myid = "";

    (async () => (myid = await me()))();

    export let msg: ChatMessage;
</script>

<div>
    <span
        class:own={msg.sender == myid}
        class="rounded p-1 px-2 max-w-[80%] [&.own]:bg-primary-700 [&.own]:float-right sm:[&.own]:float-left bg-gray-700 float-left"
    >
        {msg.message}
    </span>
</div>
