import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), svelte(), compress()],
    vite: {
        server: {
            watch: {
                ignored: ["**/target/**"],
            },
        },
    },
});
