import { defineConfig } from "vite";

export default defineConfig({
  // Explicit base for GitHub Pages project site
  base: "/cypher_game_gemini/",
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
