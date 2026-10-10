# VashFX Homepage

A React and TypeScript homepage built with Vite and backed by a Cloudflare Worker. The current application is a starter page with a counter and an API button.

The stack uses React, TypeScript, the React and Cloudflare Vite plugins, Wrangler, Oxlint, and Node's built-in test runner. See [package.json](package.json) for dependency ranges and scripts, and [package-lock.json](package-lock.json) for resolved versions.

## Get started

Install Git, Node.js 24 or 26, and npm. Both Node versions are exercised by [CI](.github/workflows/node.js.yml).

```sh
git clone https://github.com/vash-fiery/vashfx-homepage.git
cd vashfx-homepage
npm ci
npm run dev
```

Run commands from the repository root. Use `npm ci` for an unchanged manifest and lockfile; use `npm install` when intentionally changing dependencies.

Open the local URL printed by Vite. The [Vite configuration](vite.config.ts) loads the React and Cloudflare plugins, so the app and Worker are developed together. Edit [src/App.tsx](src/App.tsx) for the page or [worker/index.ts](worker/index.ts) for the API.

## Commands

Use the repository-local toolchain through the scripts in [package.json](package.json).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with the React and Cloudflare plugins. |
| `npm run lint` | Run Oxlint with [.oxlintrc.json](.oxlintrc.json). |
| `npm test` | Run Worker handler tests with Node's test runner and TypeScript stripping. |
| `npm run build` | Run `tsc -b` for the referenced TypeScript projects, then build with Vite into `dist/`. |
| `npm run preview` | Build, then serve a local preview with Vite. |
| `npm run cf-typegen` | Run `wrangler types` to regenerate Worker runtime and environment declarations. |
| `npm run deploy` | Build, then publish the Worker and assets with Wrangler. Requires Cloudflare access. |

Linting and test execution do not replace TypeScript checking; `npm run build` checks the app, Node tooling, and Worker projects referenced by [tsconfig.json](tsconfig.json).

## Project layout

| Path | Role |
| --- | --- |
| [src/main.tsx](src/main.tsx) | Mounts the React application. |
| [src/App.tsx](src/App.tsx) | Starter UI, counter, and API request handling. |
| [src/App.css](src/App.css), [src/index.css](src/index.css) | Application and global styles. |
| [src/assets/](src/assets/), [public/](public/) | Imported application assets and static public files. |
| [worker/index.ts](worker/index.ts) | Worker entry point and exported `handleRequest` function. |
| [worker/index.test.ts](worker/index.test.ts) | Direct-handler API and route-boundary tests. |
| [vite.config.ts](vite.config.ts), [wrangler.jsonc](wrangler.jsonc) | Build plugins and persistent Worker configuration. |
| [worker-configuration.d.ts](worker-configuration.d.ts) | Committed, generated runtime and binding types. |
| [.github/workflows/](.github/workflows/) | CI, CodeQL scanning, and PR labeling. |

## Application and API behavior

The counter starts at `0`. The API button initially displays `Name from API is: Cloudflare`; this initial label is local state, not evidence of a completed request.

Clicking the API button requests the same-origin path `/api/`. While waiting, the button is disabled and displays `loading…`. It checks the HTTP status and requires a string `name` in the JSON response. Success displays that name; a failed request or invalid response displays `unavailable`.

The [Worker handler](worker/index.ts) uses the URL pathname:

- Paths starting with `/api/`, including `/api/status?source=test`, return HTTP `200` with JSON `{"name":"Cloudflare"}`.
- The handler does not restrict the HTTP method.
- `/api` without the trailing slash and lookalikes such as `/apiary` are outside the API namespace.
- Non-API requests that reach the handler return an empty `404` response.

[wrangler.jsonc](wrangler.jsonc) runs the Worker first for `/api/*` and configures static assets with the `ASSETS` binding and single-page-app fallback. Asset routing is separate from the handler: a direct-handler `404` for `/` does not mean the deployed homepage returns `404`.

## Configuration and generated types

[wrangler.jsonc](wrangler.jsonc) is the source of truth for the Worker name (`vashfx-homepage`), entry point, assets, compatibility date and flags, observability, and source-map upload.

Regenerate types after changing bindings, compatibility settings, or runtime typing assumptions, including relevant Wrangler/workerd upgrades:

```sh
npm run cf-typegen
```

Review [worker-configuration.d.ts](worker-configuration.d.ts), especially its generation header and `Env`/`ASSETS` declarations. Generate types before the final lint, test, and build checks, and commit the file when its generated content changes. Do not hand-edit generated runtime declarations.

### Environment settings

The tracked root [.env](.env) contains public `VITE_*` configuration:

- `VITE_GLOB_API_URL` and `VITE_APP_API_BASE_URL` are defined, but the API button calls the literal path `/api/`; changing these values does not change that request.
- `VITE_GLOB_OPEN_LONG_REPLY` and `VITE_GLOB_APP_PWA` are defined, but the current app does not implement those features.

These variables also appear in the generated environment types. A type declaration does not establish that the app consumes a setting.

Treat `VITE_*` values as public client configuration. Keep credentials out of them and all tracked files. Use ignored local secret files and Cloudflare secrets for private values. The existing `.env` is tracked; [.gitignore](.gitignore) ignores local `.env*` files except `.env.example`, but does not untrack an existing file.

### Development tools

`@openai/codex` and `eruda` are development dependencies. Neither is imported by the current app or Worker, and the application has no OpenAI API integration or initialized Eruda console.

## Verify changes

For executable code, configuration, dependency, or generated-type changes, run:

```sh
npm run lint
npm test
npm run build
```

The [Worker tests](worker/index.test.ts) cover `/api/`, `/api/status?source=test`, `/`, `/api`, and `/apiary`, including response bodies and JSON content type. They call `handleRequest` directly; they do not exercise browser interaction or Cloudflare's asset-routing layer.

For a local browser check with `npm run dev` or `npm run preview`:

1. Confirm that the counter starts at `0` and increments when clicked.
2. Click the API button and inspect the network request to `/api/`; the initial `Cloudflare` label alone does not verify API connectivity.
3. Confirm the loading/disabled state, successful response, and `unavailable` state after a failed request or invalid response.
4. When changing assets or routing, check the homepage and SPA fallback through the local server as well as the API routes.

For documentation-only changes, verify commands, links, paths, and behavior against their source files and run `git diff --check`. Lint, tests, build, and type generation may be skipped when executable inputs are unchanged.

## Deployment and CI

Before deploying, configure Wrangler authentication and confirm the target Cloudflare account and [Worker configuration](wrangler.jsonc). Complete the validation above, then run:

```sh
npm run deploy
```

This command builds and publishes remotely. Use `npm run preview` for a local build preview.

The [CI workflow](.github/workflows/node.js.yml) runs `npm ci`, lint, tests, and build on Node.js 24 and 26 for pushes to `main`, pull requests targeting `main`, and manual dispatch. Markdown-only changes also trigger these checks. The Cloudflare deployment job is currently commented out, so this workflow does not deploy the site; recheck it before relying on that behavior.

Cloudflare also reports a separate `Workers Builds: vashfx-homepage` check that supplies branch preview URLs. This integration is independent of the GitHub Actions deployment job. Review its Cloudflare build/deploy settings before assuming a push or merge will only run validation.

[CodeQL](.github/workflows/codeql.yml) scans JavaScript/TypeScript and GitHub Actions on pushes and pull requests to `main`, plus a weekly schedule.

## Contributing

Read [AGENTS.md](AGENTS.md) for repository policy and [SKILLS.md](SKILLS.md) for task-specific workflows. Use a topic branch and pull request, keep changes focused, and include the validation performed. Keep build output, local Wrangler state, and secrets out of commits. Deployment is a separate action that must be explicitly requested.
