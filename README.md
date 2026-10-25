# VashFX Homepage

A React and TypeScript homepage built with Vite and backed by a Cloudflare Worker. The current application is a starter page with a counter and an API button.

| Layer | Tooling |
| --- | --- |
| Frontend | `React` and `TypeScript`. |
| Build and local development | `Vite` with the React and Cloudflare plugins. |
| API and deployment | `Cloudflare Workers` and `Wrangler`. |
| Validation | `Oxlint`, `node:test`, and TypeScript build checks. |
| Runtime and packages | Node.js `24` or `26`, `npm`, and a committed lockfile. |

Read [package.json](package.json) for scripts and dependency ranges, and [package-lock.json](package-lock.json) for resolved versions.

[Setup](#get-started) · [Commands](#commands) · [API](#application-and-api-behavior) · [Configuration](#configuration-and-generated-types) · [Validation](#verify-changes) · [Deployment and CI](#deployment-and-ci)

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
| `npm test` | Run client API and Worker handler tests with Node's test runner and TypeScript stripping. |
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
| [.github/dependabot.yml](.github/dependabot.yml) | Dependency update configuration. |
| [AGENTS.md](AGENTS.md), [SKILLS.md](SKILLS.md) | Repository policy, formatting defaults, and task workflows. |

## Application and API behavior

The counter starts at `0` and increments when clicked. The API button requests the same-origin path `/api/` and requires both a successful HTTP status and a string `name` in the JSON response. A 10-second timeout covers both the request and reading its response body; a timeout shows `unavailable` and enables the button again so the request can be retried.

| API button state | Display and behavior |
| --- | --- |
| Initial | Shows `Cloudflare` from local state; no request has been made. |
| Loading | Shows `loading…` and disables the button while the request is pending. |
| Success | Displays the returned `name`. |
| Request or response failure | Displays `unavailable`. |

The [Worker handler](worker/index.ts) matches the URL pathname and currently accepts every HTTP method:

| Request path | Direct-handler response |
| --- | --- |
| `/api/` | HTTP `200` with the JSON response below. |
| `/api/status?source=test` and other `/api/` paths | HTTP `200` with the same JSON; query strings do not change routing. |
| `/api`, `/apiary` | Empty HTTP `404`; these are outside the `/api/` namespace. |
| Other paths, including `/` | Empty HTTP `404` when passed directly to the handler. |

```json
{
  "name": "Cloudflare"
}
```

[wrangler.jsonc](wrangler.jsonc) runs the Worker first for `/api/*` and configures static assets with the `ASSETS` binding and single-page-app fallback. Asset routing is separate from the handler: a direct-handler `404` for `/` does not mean the deployed homepage returns `404`.

## Configuration and generated types

[wrangler.jsonc](wrangler.jsonc) is the source of truth for persistent Worker configuration:

| Setting | Configured value |
| --- | --- |
| Worker name | `vashfx-homepage`. |
| Entry point | `worker/index.ts`. |
| Compatibility date | `2026-09-09`. |
| Compatibility flag | `nodejs_compat`. |
| Assets | `./dist`, exposed through `ASSETS`. |
| Asset fallback | `single-page-application`. |
| Worker-first routes | `/api/*`. |
| Observability | `enabled: true`. |
| Source maps | `upload_source_maps: true`. |

Regenerate types after changing bindings, compatibility settings, or runtime typing assumptions, including relevant Wrangler/workerd upgrades:

```sh
npm run cf-typegen
```

Review [worker-configuration.d.ts](worker-configuration.d.ts), especially its generation header and `Env`/`ASSETS` declarations. Generate types before the final lint, test, and build checks, and commit the file when its generated content changes. Do not hand-edit generated runtime declarations.

Compare the header with the resolved top-level Wrangler/workerd toolchain; the Vite plugin can use its own nested runtime versions. See the dated [maintenance comparison](SKILLS.md#maintenance-drift-to-verify) before runtime or dependency maintenance.

### Environment settings

The tracked root [.env](.env) contains public `VITE_*` configuration:

| Variable | Current application use |
| --- | --- |
| `VITE_GLOB_API_URL` | Defined; the API button uses the literal path `/api/`. |
| `VITE_APP_API_BASE_URL` | Defined; changing it does not change the API button's request. |
| `VITE_GLOB_OPEN_LONG_REPLY` | Defined; long-reply behavior is not implemented. |
| `VITE_GLOB_APP_PWA` | Defined; PWA behavior is not implemented. |

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

The [client API tests](tests/api.test.ts) cover successful responses, HTTP and network errors, malformed JSON, invalid payloads, and timeouts before headers or while reading the body. They mock network access and use Node's existing test runner; the Node TypeScript project checks their types during `npm run build`.

For a local browser check with `npm run dev` or `npm run preview`:

1. Confirm that the counter starts at `0` and increments when clicked.
2. Click the API button and inspect the network request to `/api/`; the initial `Cloudflare` label alone does not verify API connectivity.
3. Confirm the loading/disabled state, successful response, and `unavailable` state after a failed request or invalid response.
4. When changing assets or routing, check the homepage and SPA fallback through the local server as well as the API routes.

For documentation-only changes, verify commands, links, paths, and behavior against their source files, then check whitespace and patch errors:

```sh
git diff --check
```

Lint, tests, build, and type generation may be skipped when executable inputs are unchanged. Report which checks ran and which were skipped.

## Deployment and CI

Before deploying, configure Wrangler authentication and confirm the target Cloudflare account and [Worker configuration](wrangler.jsonc). Complete the validation above, then run:

```sh
npm run deploy
```

This command builds and publishes remotely. Use `npm run preview` for a local build preview.

| Automation | Current behavior |
| --- | --- |
| [CI](.github/workflows/node.js.yml) | Pushes and PRs to `main`, plus manual dispatch; runs `npm ci`, lint, tests, and build on Node.js `24` and `26`, then uploads build artifacts. |
| [CodeQL](.github/workflows/codeql.yml) | Scans `javascript-typescript` and `actions` on pushes and PRs to `main`, plus a weekly schedule. |
| [Labeler](.github/workflows/labeler.yml) | Runs on `pull_request` using the path rules in [.github/labeler.yml](.github/labeler.yml). |
| [Dependabot](.github/dependabot.yml) | Daily update checks configured for `npm`, `github-actions`, and `docker`. |
| Cloudflare Workers Builds | Reports `Workers Builds: vashfx-homepage` independently of GitHub Actions. |

Markdown-only changes also trigger CI. The Cloudflare deployment job in the Actions workflow is currently commented out; recheck the live workflow before relying on that behavior.

For Workers Builds, review the reported build/version details, any supplied preview URL, and the integration's branch/build/deploy settings. A successful check alone does not establish which version is live in production, and the commented Actions job does not control this separate integration.

Docker dependency updates are configured, but no `Dockerfile` is currently tracked.

## Contributing

Read [AGENTS.md](AGENTS.md) for repository policy and [SKILLS.md](SKILLS.md) for task-specific workflows. Use a topic branch and pull request, keep changes focused, and include the validation performed. Keep build output, local Wrangler state, and secrets out of commits. Deployment is a separate action that must be explicitly requested.

Follow the [formatting policy](AGENTS.md#preferred-formatting) and [presentation workflow](SKILLS.md#formatting-and-presentation): compact native Markdown tables, monospace commands and values, and language-tagged code blocks. Rich-output card styling is defined in the policy; GitHub supplies the README's rendered theme and spacing.
