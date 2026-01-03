import { defineConfig } from "vite";

export default defineConfig({
  // Use a relative base so built assets resolve correctly regardless of host path
  base: "./",
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
