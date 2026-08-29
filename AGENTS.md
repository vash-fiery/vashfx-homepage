# AGENTS.md

## Scope

These instructions apply to the entire repository. If a more specific
`AGENTS.md` is added inside a subdirectory, follow that file for work in its
scope.

## Project overview

- This is a React 19 single-page application written in TypeScript and built
  with Vite 8.
- The browser application lives in `src/`; static public assets live in
  `public/`.
- `worker/index.ts` is the Cloudflare Worker entry point and handles routes
  under `/api/`.
- `wrangler.jsonc` configures the Worker, SPA asset fallback, compatibility
  settings, observability, and source-map uploads.
- TypeScript uses project references for browser, Node/Vite, and Worker code.

## Setup and commands

Use Node.js 24 or newer and npm. Keep `package-lock.json` authoritative and
install reproducibly with:

```sh
npm ci
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite and the local Cloudflare development environment |
| `npm run lint` | Run Oxlint |
| `npm run build` | Type-check all projects and build the production bundle |
| `npm run preview` | Build and preview the production bundle locally |
| `npm run cf-typegen` | Regenerate Cloudflare binding types |
| `npm run deploy` | Build and deploy to Cloudflare; run only when explicitly requested |

## Change guidelines

- Read the relevant source and configuration before editing, and keep changes
  tightly scoped to the requested task.
- Put browser UI and client-side behavior in `src/`. Put Worker request
  handling and API behavior in `worker/`.
- Preserve the `/api/` routing boundary unless the task explicitly changes
  the public API.
- Use TypeScript and ES modules. Prefer explicit, narrow types and avoid
  introducing `any`.
- Follow the repository's Oxlint formatting: no semicolons, single quotes, and
  an 80-column target.
- Use React function components and hooks. Keep render logic focused and move
  reusable behavior into appropriately named components or hooks.
- Prefer the existing stylesheets over new inline styles. Preserve responsive
  behavior, light/dark color support, and the CSS custom-property system.
- Keep UI changes accessible: use semantic HTML, keyboard-operable controls,
  useful labels, and meaningful alternative text where an image conveys
  content.
- Never commit credentials or production secrets. Use Wrangler secrets or
  ignored local environment files.
- When Cloudflare bindings change, run `npm run cf-typegen` and include the
  resulting type updates when appropriate.
- Change `wrangler.jsonc` compatibility dates or flags only intentionally and
  explain the reason in the pull request.
- Change dependencies through npm so `package.json` and `package-lock.json`
  remain synchronized. Do not hand-edit lockfile dependency entries.

## Validation

For application, Worker, dependency, or configuration changes, run:

```sh
npm run lint
npm run build
```

Also verify the affected behavior locally with `npm run dev` when practical.
For route-related changes, check both the SPA and the relevant `/api/` path.

There is currently no automated test script. Do not claim tests passed unless a
test suite has been added and run. Documentation-only changes do not require
runtime checks, but still review Markdown structure, commands, and paths for
accuracy.

## Generated and local files

Do not commit `node_modules/`, `dist/`, `.wrangler/`, local logs, editor
state, `.env*`, or `.dev.vars*`. The tracked example environment files are
the only exceptions already allowed by `.gitignore`.

## Commits and pull requests

- Do not modify or stage unrelated files.
- Use concise commit subjects that describe the completed change.
- In pull requests, summarize the user-visible or developer-visible impact and
  list the validation commands actually run.
- Do not deploy from an agent session unless the user explicitly requests a
  deployment and confirms the target environment.
