# mepmep-ui (frontend)

React + TypeScript + Vite app for the mepmep movie site. Talks to the `mepmep` backend repo.

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
