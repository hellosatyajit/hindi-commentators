import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
// import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  server: {
    preset: 'vercel',
  },
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
    build: {
      rollupOptions: {
        external: ['node:stream', 'node:stream/web', 'node:async_hooks'],
      },
    },
  },
  
});
