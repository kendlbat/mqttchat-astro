<script lang="ts">
    import {
        Button,
        Modal,
        Label,
        Input,
        Checkbox,
        Helper,
        Alert,
        Spinner,
        Toast,
    } from "flowbite-svelte";
    import Mqtt from "@lib/mqtt";
    import { InfoCircleSolid, CloseCircleSolid } from "flowbite-svelte-icons";

    let broker: string =
        localStorage.getItem("mqtt-broker") || "wss://localhost:9002";
    let anon: boolean = localStorage.getItem("mqtt-password") == "";
    let user: string = localStorage.getItem("mqtt-username") || "";
    let password: string = localStorage.getItem("mqtt-password") || "";
    let connecting: boolean = false;
    let connectionFailed: boolean = false;
    const validationErrors: {
        broker?: string;
        user?: string;
        password?: string;
    } = {};

    function validate(): boolean {
        broker = broker.trim();
        user = user.trim();
        password = password.trim();

        if (broker == "") {
            validationErrors.broker = "Broker address is required";
        } else if (!broker.match("^(ws[s]?)://[a-zA-Z0-9.-]+(:[0-9]+)?$")) {
            validationErrors.broker = "Invalid broker address";
        } else {
            delete validationErrors.broker;
        }

        if (user == "") {
            validationErrors.user = "Username is required";
        } else {
            delete validationErrors.user;
        }

        if (!anon) {
            if (password == "") {
                validationErrors.password = "Password is required";
            } else {
                delete validationErrors.password;
            }
        }

        return Object.keys(validationErrors).length == 0;
    }

    function onSubmit() {
        connectionFailed = false;
        connecting = true;
        if (!validate()) {
            connecting = false;
            return;
        }

        let mqtt: Mqtt;
        if (anon) mqtt = new Mqtt(broker, user);
        else mqtt = new Mqtt(broker, user, password);

        mqtt.waitUntilConnected(10000)
            .then(() => {
                mqtt.disconnect();
                window.location.href = "/chat";
            })
            .catch((err) => {
                console.error(err);
                connecting = false;
                connectionFailed = true;

                setTimeout(() => {
                    connectionFailed = false;
                }, 5000);
            });
    }
</script>

<Modal
    open={true}
    size="xs"
    autoclose={false}
    dismissable={false}
    class="w-full"
>
    <form
        class="flex flex-col space-y-3"
        on:submit={onSubmit}
        action="javascript:void(0);"
    >
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">
            Provide broker details
        </h3>
        <Label>
            <span>Broker</span>

            <Input
                type="text"
                name="broker"
                placeholder="ws://localhost:9002"
                pattern="^[^\s]+$"
                color={validationErrors.broker ? "red" : "base"}
                bind:value={broker}
                disabled={connecting}
                required
            />
            {#if validationErrors.broker}
                <Helper color="red" class="mt-1">
                    {validationErrors.broker}
                </Helper>
            {/if}
        </Label>
        <Checkbox disabled={connecting} bind:checked={anon}
            >Anonymous login</Checkbox
        >
        {#if !anon && broker.match("^(mqtt[^s]|ws[^s])")}
            <Alert color="red" class="space-y-0">
                <InfoCircleSolid slot="icon" class="h-4 w-4" />
                <span class="block font-bold">Insecure connection!</span>
                Your username and password will be sent over an unencrypted connection.
            </Alert>
        {/if}
        <Label>
            <span>
                {#if anon}
                    Display name
                {:else}
                    Username
                {/if}
            </span>
            <Input
                type="text"
                bind:value={user}
                name="username"
                pattern="^[^\s]+$"
                class="mt-1"
                disabled={connecting}
                required
            />
        </Label>
        {#if !anon}
            <Label>
                <span>Password</span>
                <Input
                    type="password"
                    name="password"
                    placeholder="••••••••••"
                    pattern="^[^\s]+$"
                    bind:value={password}
                    disabled={connecting}
                    required
                />
            </Label>
        {/if}

        <Toast
            color="red"
            dismissable={false}
            class={`border-[1px] border-none border-red-600 py-2 pl-0 shadow-none ${
                connectionFailed ? "opacity-100 " : "h-0 opacity-0"
            } transition-[height,opacity]`}
        >
            <svelte:fragment slot="icon">
                <CloseCircleSolid class="h-5 w-5" />
                <span class="sr-only">Error icon</span>
            </svelte:fragment>
            Connection failed
        </Toast>

        <Button type="submit" class="w-full1" disabled={connecting}
            >{#if connecting}
                <Spinner size="5" />
            {:else}
                Connect
            {/if}</Button
        >
    </form>
</Modal>
