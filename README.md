# VashFX Homepage

A React and TypeScript homepage backed by a Cloudflare Worker. The current UI is a starter page with a counter and a button that calls the Worker API; it is not yet a finished homepage.

## Get started

Use Node.js 24 or 26 and npm (the versions exercised by CI).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Edit `src/App.tsx` for the page or `worker/index.ts` for the API; the Vite development server reloads changes.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server with the Cloudflare plugin. |
| `npm run lint` | Run Oxlint. |
| `npm test` | Run Worker unit tests with Node's test runner. |
| `npm run build` | Check TypeScript projects and build the site into `dist/`. |
| `npm run preview` | Build, then serve a local preview with Vite. |
| `npm run cf-typegen` | Generate Cloudflare Worker and binding types from Wrangler configuration. |
| `npm run deploy` | Build and deploy the Worker and assets with Wrangler. Requires Cloudflare access. |

Before submitting code changes, run `npm run lint`, `npm test`, and `npm run build`.

## How it works

- `src/main.tsx` mounts the React app in `src/App.tsx`; styles live in `src/App.css` and `src/index.css`.
- `worker/index.ts` handles paths beginning with `/api/`. The current example response is HTTP 200 with `{"name":"Cloudflare"}`; the UI calls `/api/` to display that name. The handler does not restrict the HTTP method.
- `/api` without a trailing slash is not an API route. Other non-API requests reaching the handler get an empty 404. Cloudflare serves the built static assets separately, with single-page-app fallback configured in `wrangler.jsonc`.
- `worker/index.test.ts` tests the handler directly, including route boundaries; it does not test Cloudflare's static asset routing.
- `vite.config.ts` configures the React and Cloudflare Vite plugins. `wrangler.jsonc` defines the Worker entry point, assets directory, and Worker-first `/api/*` routing.

## Deployment

`npm run deploy` runs a build and then `wrangler deploy`. Configure Wrangler authentication and the target Cloudflare account before using it. Deployment publishes remotely; `npm run preview` is the local preview command.

The current GitHub Actions CI runs install, lint, tests, and build on Node.js 24 and 26 for pull requests and pushes to `main`. Its Cloudflare deployment job is commented out, so CI does not currently deploy the site.

For repository-specific contribution guidance, see [AGENTS.md](AGENTS.md) and [SKILLS.md](SKILLS.md).
