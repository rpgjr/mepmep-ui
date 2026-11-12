# mepmep-ui (frontend)

React + TypeScript + Vite app for the mepmep movie site. Talks to the `mepmep` backend repo.
Styled with Tailwind CSS 4 and shadcn/ui components (the component code lives in `src/components/ui`, the theme colors in `src/index.css`).

## Run locally

```
npm install
API_PROXY=http://localhost:8080 npm run dev     # http://localhost:5173
```
`API_PROXY` is where the backend runs (default `http://localhost:8090`).

## Build

```
npm run build        # type-check + production build into dist/
```
Set `VITE_API_URL=https://your-backend/api` at build time for production.
`public/_redirects` and `vercel.json` make deep links work on Cloudflare Pages / Netlify / Vercel.

## Checks

```
npm run lint         # Biome: code style and common mistakes
npm run build        # type-check + production build
npm run test:e2e     # Playwright: opens the app in a browser and clicks through the main flows
```

`.github/workflows/ci.yml` runs `lint`, `build` and `e2e` on every pull request.
`.github/workflows/security.yml` runs `secrets` (gitleaks) and `codeql`.
Vercel deploys `main` by itself. Its settings live in the Vercel dashboard, and `vercel.json` holds the deep-link rewrite.

## UI components (shadcn/ui)

Add another ready-made part with `npx shadcn@latest add <name>` (for example `dialog`). The command reads `components.json` and copies the component into `src/components/ui`, where you can edit it.
Tailwind classes go straight on the elements. To change a color for the whole site, edit it in `src/index.css`.
