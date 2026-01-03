import { defineConfig } from "vite";

const repoName = "cypher_game_gemini";

export default defineConfig({
  base: `/${repoName}/`,
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
