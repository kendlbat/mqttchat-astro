<script lang="ts">
    import type { ChatMessage } from "@lib/types";
    import { getUsername, me } from "@lib/users";

    let myid = me();

    export let msg: ChatMessage;
</script>

<div>
    <span
        class:own={msg.sender == myid}
        class="float-left max-w-[80%] rounded-none border-l-4 border-l-gray-700 bg-transparent p-1 px-2 [&.own]:border-l-primary-700"
    >
        <span class="block text-xs">
            {#await getUsername(msg.sender)}
                {""}
            {:then username}
                {username || ""}
            {/await}
        </span>
        <span>
            {msg.message}
        </span>
    </span>
</div>
