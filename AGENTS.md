# AGENTS.md

## Scope

These instructions apply to the entire repository unless a more deeply nested `AGENTS.md` or `AGENTS.override.md` provides more specific guidance.

This repository is the source for the VashFX homepage. Treat it as a production web application deployed on Cloudflare Workers.

## Project stack

- React 19 + React DOM
- TypeScript 6
- Vite 8
- Cloudflare Workers + `@cloudflare/vite-plugin`
- Wrangler 4
- Oxlint
- Node.js built-in test runner
- npm with a committed `package-lock.json`

The CI matrix runs on Node 24 and Node 26. Avoid code or tooling assumptions that only work on one of those versions unless the change explicitly updates CI support.

## Repository map

- `src/` — React application source.
- `src/App.tsx` — primary application component.
- `src/App.css` and `src/index.css` — application styling.
- `public/` — static public assets copied by Vite.
- `worker/index.ts` — Cloudflare Worker request handler.
- `worker/index.test.ts` — Worker unit tests using `node:test`.
- `wrangler.jsonc` — source of truth for Cloudflare Worker configuration.
- `worker-configuration.d.ts` — generated Worker/runtime and binding types.
- `vite.config.ts` — Vite and Cloudflare plugin configuration.
- `.oxlintrc.json` — lint configuration.
- `.github/workflows/node.js.yml` — Node CI for lint, test, and build.
- `.github/workflows/codeql.yml` — CodeQL security scanning.
- `.github/dependabot.yml` — dependency update automation.

## Working principles

1. Read the relevant files before editing them. Preserve existing behavior unless the task explicitly asks for a behavior change.
2. Keep patches focused. Do not reformat, rename, reorganize, or upgrade unrelated code or dependencies.
3. Prefer the existing project patterns and dependencies over introducing new libraries.
4. Do not overwrite user changes or revert unrelated work.
5. Do not commit generated build output such as `dist/` or local Wrangler state.
6. Do not deploy, publish, rotate secrets, change DNS/routes, or mutate remote Cloudflare resources unless the user explicitly asks for that action.
7. When a command fails, report the failure and root cause. Do not hide failures by weakening lint, tests, TypeScript, CI, or security checks.

## Install and development

Use the repository-local toolchain through npm scripts.

```sh
npm ci
npm run dev
```

Use `npm ci` for reproducible installs when `package.json` and `package-lock.json` are already in sync. Use `npm install` only when intentionally changing dependencies or regenerating the lockfile.

Do not install Wrangler, Vite, TypeScript, Oxlint, or Codex globally just to work on this repository.

## Required validation

After code changes, run all of the following from the repository root:

```sh
npm run lint
npm test
npm run build
```

These commands mirror the repository's CI checks and are required even for changes that look small if they can affect runtime behavior, configuration, generated types, dependencies, or tooling.

For documentation-only changes that cannot affect executable behavior, still make a best effort to run the checks when the environment is available. If checks are skipped, state exactly which checks were not run and why.

### Cloudflare type generation

Run the following whenever `wrangler.jsonc`, Worker bindings, compatibility flags, compatibility date, or Cloudflare runtime typing assumptions change:

```sh
npm run cf-typegen
```

Review the resulting `worker-configuration.d.ts`. Commit it only when the generated types legitimately changed. Do not hand-edit generated sections to mask a configuration/type mismatch.

## Frontend guidance

- Keep React components typed and idiomatic for React 19.
- Preserve accessibility semantics: use real buttons, links, headings, labels, and landmarks where appropriate.
- Keep keyboard and focus behavior intact when changing interactive UI.
- Prefer CSS in the existing stylesheet structure rather than adding inline styles without a clear reason.
- Avoid unnecessary client-side state and effects. Derive values during render when possible.
- Do not introduce `dangerouslySetInnerHTML` for untrusted or dynamic content.
- When rendering external URLs, validate or constrain them before use. Do not create `javascript:` or other unsafe navigation paths.
- Keep static assets in `public/` or `src/assets/` according to how they are imported and bundled today.

## Worker and API guidance

The Worker entry point is `worker/index.ts`.

Current routing intentionally distinguishes API requests from application assets:

- Wrangler runs the Worker first for `/api/*`.
- The Worker handles paths beginning with `/api/`.
- Non-API requests that reach the Worker currently return an empty `404` response.
- Static SPA assets are served from `dist` by the Cloudflare assets binding.

When changing Worker behavior:

1. Keep route matching explicit. Avoid accidentally broadening `/api/` handling to paths such as `/api`, `/apiary`, or unrelated frontend routes unless requested.
2. Add or update tests in `worker/index.test.ts` for every observable API behavior change, including success, failure, boundary, and malformed-input cases where relevant.
3. Prefer Web Platform APIs available in Workers instead of Node-only APIs unless `nodejs_compat` is intentionally required.
4. Validate all request-derived input before using it in URLs, redirects, headers, upstream fetches, storage keys, or generated output.
5. Do not proxy arbitrary user-controlled URLs. Constrain upstream origins to an allowlist when outbound fetching is introduced.
6. Do not reflect untrusted input into headers without validation. Guard against response splitting, open redirects, cache poisoning, and unsafe CORS behavior.
7. Return intentional HTTP status codes and content types. Avoid leaking stack traces, credentials, internal IDs, environment values, or configuration details in responses.

## Cloudflare and Wrangler rules

`wrangler.jsonc` is the source of truth for the Worker configuration.

Current important settings include:

- Worker name: `vashfx-homepage`
- Worker entry point: `worker/index.ts`
- Assets directory: `./dist`
- Assets binding: `ASSETS`
- SPA not-found handling enabled
- Worker-first routes: `/api/*`
- Observability enabled
- Source-map upload enabled
- `nodejs_compat` compatibility flag

When editing Cloudflare configuration:

- Make the smallest required change and preserve comments unless they are obsolete.
- Keep the `compatibility_date` intentional. Do not bump it as drive-by maintenance because runtime behavior can change with it.
- Re-run `npm run cf-typegen` after binding or runtime configuration changes.
- Prefer configuration in `wrangler.jsonc` over ad hoc CLI flags for persistent project behavior.
- Never store secret values in `wrangler.jsonc`, source files, tests, committed `.env` files, or committed `.dev.vars` files.
- Local secrets belong in `.dev.vars` or `.env`; these are ignored by Git. Keep example files value-free.
- For deployed secrets, use Cloudflare secret mechanisms such as `wrangler secret put` when explicitly requested. Do not place secret values directly in shell commands when an interactive secret prompt is available.
- Do not run `npm run deploy` or `wrangler deploy` unless deployment is explicitly part of the user's request.
- Do not change Worker routes, custom domains, account identifiers, production bindings, or remote resources without explicit approval.

## Security requirements

Treat security regressions as correctness bugs.

Before finishing a change, inspect the diff for:

- hard-coded credentials, tokens, API keys, cookies, private URLs, or personal data;
- accidental inclusion of `.env`, `.dev.vars`, Wrangler state, logs, build output, or other local files;
- XSS and unsafe HTML rendering;
- command, template, path, URL, header, or query injection;
- SSRF and unrestricted outbound fetch targets;
- open redirects and unsafe URL schemes;
- overly permissive CORS or security-header changes;
- exposure of secrets through logs, exceptions, JSON responses, source maps, or client-side bundles;
- authorization assumptions if protected endpoints are introduced;
- dependency additions with unnecessary install scripts, broad permissions, or suspicious provenance;
- GitHub Actions changes that broaden permissions or execute untrusted pull-request data in privileged contexts.

Do not disable or weaken CodeQL, Dependabot, lint rules, TypeScript checks, tests, GitHub Actions permissions, or other security controls merely to make a change pass.

If a security finding cannot be fixed within the requested scope, describe it clearly in the final response rather than silently accepting it.

## Dependencies

Before adding a dependency:

1. Check whether the platform, React, Vite, or an existing dependency already provides the needed capability.
2. Prefer small, actively maintained packages with a clear purpose.
3. Avoid dependencies for trivial helpers.
4. Update both `package.json` and `package-lock.json` together.
5. Run the full required validation after dependency changes.
6. Review install scripts and transitive impact when the dependency is security-sensitive or unusually privileged.

Do not perform unrelated dependency upgrades in the same patch unless explicitly requested.

## Tests

Worker tests use Node's built-in test runner and TypeScript stripping through the existing `npm test` script.

- Add regression tests when fixing bugs.
- Prefer deterministic tests without external network access.
- Test route boundaries, not only happy paths.
- Do not make tests depend on production Cloudflare credentials or mutable remote resources.
- Keep tests readable and focused on externally observable behavior.

For frontend changes without an existing browser test harness, validate with `npm run lint` and `npm run build`, and reason carefully about accessibility, responsive behavior, and user-visible regressions. Do not add a large test framework unless the task warrants it.

## Generated and ignored files

The repository ignores, among other local artifacts:

- `node_modules/`
- `dist/`
- `.wrangler/`
- `.dev.vars*` except `.dev.vars.example`
- `.env*` except `.env.example`

Do not force-add ignored secret or build files.

`worker-configuration.d.ts` is committed generated output. Regenerate it with `npm run cf-typegen` when required instead of editing generated runtime types manually.

## GitHub Actions

The main CI workflow runs on Ubuntu with Node 24 and Node 26 and executes:

```sh
npm ci
npm run lint
npm test
npm run build
```

CodeQL scans GitHub Actions and JavaScript/TypeScript.

When changing workflows:

- Keep permissions least-privileged.
- Prefer pinned or trusted official actions.
- Avoid interpolating untrusted PR/issue content directly into shell commands.
- Do not switch privileged workflows to `pull_request_target` without a specific security-reviewed reason.
- Preserve the Node 24/26 compatibility expectation unless the task intentionally changes supported versions.

## Change completion checklist

Before reporting completion:

1. Review `git diff`/the final patch for unintended changes.
2. Confirm no secrets or local-only artifacts were added.
3. Run `npm run lint`.
4. Run `npm test`.
5. Run `npm run build`.
6. Run `npm run cf-typegen` when Cloudflare configuration or runtime types changed.
7. Confirm generated files are intentional.
8. Confirm no deployment or remote mutation occurred unless explicitly requested.
9. Summarize what changed and list the validation commands actually run, including any failures or skips.
