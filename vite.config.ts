import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

// Standard TanStack Start config (no Lovable wrapper).
// - tanstackStart() provides SSR, server functions and routing (it includes
//   the router plugin; using @tanstack/router-plugin alone would break
//   server functions).
// - nitro() with the Vercel preset builds the server bundle Vercel runs.
//   serverEntry.handler keeps the custom SSR error wrapper in src/server.ts
//   (previously wired by the Lovable config's `server: { entry: "server" }`).
// - viteTsConfigPaths() provides the `@` -> ./src/* alias from tsconfig.json.
// - VITE_* env injection is built into Vite itself.
export default defineConfig({
  plugins: [
    tailwindcss(),
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart(),
    nitro({
      preset: "vercel",
      serverEntry: { handler: "./src/server.ts" },
    }),
    viteReact(),
  ],
});
