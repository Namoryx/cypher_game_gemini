# cypher_game_gemini
Experimental projects and modules for Graph DB ( with gemini)

## Development

The project depends on Vite 5.x. If you run into integrity errors during installation, regenerate a fresh lockfile locally:

```sh
rm -rf node_modules package-lock.json
npm install
npm ci
```

Commit the new `package-lock.json` after the install succeeds so CI can use the corrected integrity values.
