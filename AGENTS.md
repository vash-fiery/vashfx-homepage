# AGENTS.md

## Scope

These instructions apply to the entire repository unless a more deeply nested `AGENTS.md` or `AGENTS.override.md` provides more specific guidance.

This repository is the source for the VashFX homepage. Treat it as a production React application deployed on Cloudflare Workers.

## Current project baseline

The repository currently uses:

- React 19.2.x + React DOM 19.2.x
- TypeScript 6.0.x
- Vite 8.2.x
- `@vitejs/plugin-react` 6.x
- Cloudflare Workers + `@cloudflare/vite-plugin` 1.54.x
- Wrangler 4.127.x
- workerd 1.20260830.x
- Oxlint 1.80.x
- Node.js built-in test runner
- npm with a committed `package-lock.json`

The CI matrix runs on Node 24 and Node 26. Changes must remain compatible with both versions unless the task explicitly updates the supported runtime matrix.

Do not treat the version list above as permission for drive-by upgrades. `package.json` and `package-lock.json` remain the source of truth for exact dependency state.

## Repository map

- `src/` — React application source.
- `src/App.tsx` — primary application component.
- `src/App.css` and `src/index.css` — application styling.
- `src/assets/` — bundled application assets.
- `public/` — static public assets copied by Vite.
- `worker/index.ts` — Cloudflare Worker request handler.
- `worker/index.test.ts` — Worker unit tests using `node:test`.
- `wrangler.jsonc` — source of truth for persistent Cloudflare Worker configuration.
- `worker-configuration.d.ts` — committed generated Worker/runtime and binding types.
- `vite.config.ts` — Vite and Cloudflare plugin configuration.
- `.oxlintrc.json` — lint configuration.
- `.github/workflows/node.js.yml` — Node CI for lint, test, and build on Node 24/26.
- `.github/workflows/codeql.yml` — CodeQL security scanning.
- `.github/dependabot.yml` — dependency update automation.

## Working principles

1. Read the relevant source, configuration, tests, and scripts before editing them.
2. Preserve existing behavior unless the task explicitly requests a behavior change.
3. Keep patches focused. Do not reformat, rename, reorganize, or upgrade unrelated code or dependencies.
4. Prefer existing project patterns, Web Platform APIs, and current dependencies over introducing new libraries.
5. Do not overwrite user changes or revert unrelated work.
6. Do not commit generated build output such as `dist/` or local Wrangler state.
7. Do not deploy, publish, rotate secrets, change DNS/routes, or mutate remote Cloudflare resources unless the user explicitly requests that action.
8. When a command fails, report the failure and root cause. Never hide failures by weakening lint, tests, TypeScript, CI, or security checks.
9. Inspect the final diff before completion and remove accidental or unrelated changes.

## Install and development

Use the repository-local toolchain through npm scripts.

```sh
npm ci
npm run dev
```

Use `npm ci` for reproducible installs when `package.json` and `package-lock.json` are already synchronized. Use `npm install` only when intentionally changing dependencies or regenerating the lockfile.

Do not install Wrangler, Vite, TypeScript, Oxlint, Codex, or other repository tooling globally just to work on this project.

### Dependency install scripts

`package.json` contains an `allowScripts` policy for selected dependency install scripts. Treat that allowlist as a supply-chain security control.

- Do not broadly enable package lifecycle scripts.
- Do not add a package to `allowScripts` merely to make installation succeed.
- Before allowing a new install script, identify why it is required and review the package and script provenance.
- Keep stale allowlist entries out when dependency changes make them unnecessary.
- Update `package.json` and `package-lock.json` together for intentional dependency changes.

## Required validation

After executable code, configuration, dependency, generated-type, or tooling changes, run from the repository root:

```sh
npm run lint
npm test
npm run build
```

These commands mirror the main CI workflow.

For documentation-only changes that cannot affect executable behavior, checks may be skipped when appropriate, but the final response must state exactly which checks were not run and why.

### Cloudflare type generation

Run:

```sh
npm run cf-typegen
```

whenever `wrangler.jsonc`, Worker bindings, compatibility flags, compatibility date, or Cloudflare runtime typing assumptions change.

Review the resulting `worker-configuration.d.ts`. Commit it only when the generated types legitimately changed. Do not hand-edit generated sections to conceal a configuration/type mismatch.

## Frontend guidance

- Keep React components typed and idiomatic for React 19.
- Preserve accessibility semantics. Prefer native buttons, links, headings, labels, and landmarks.
- Preserve keyboard navigation and visible focus behavior when changing interactive UI.
- Prefer the existing stylesheet structure over inline styles unless there is a clear reason otherwise.
- Avoid unnecessary client-side state and effects. Derive values during render when possible.
- Do not introduce `dangerouslySetInnerHTML` for untrusted or dynamic content.
- Validate or constrain dynamic external URLs before use. Never create `javascript:` or similarly unsafe navigation paths.
- Place assets in `public/` or `src/assets/` according to whether they should be copied as-is or bundled/imported by Vite.
- Keep responsive behavior intact and check common narrow and wide viewport layouts after visual changes.

## Worker and API guidance

The Worker entry point is `worker/index.ts`.

Current routing behavior is intentionally narrow:

- Wrangler runs the Worker first for `/api/*`.
- The Worker handles paths beginning with `/api/`.
- `/api` without the trailing slash is not currently an API route.
- `/apiary` and other lookalike paths are not API routes.
- Non-API requests that reach the Worker return an empty `404` response.
- Static SPA assets are served from `dist` through the Cloudflare assets binding.

When changing Worker behavior:

1. Keep route matching explicit. Do not accidentally broaden `/api/` handling.
2. Add or update tests in `worker/index.test.ts` for every observable API behavior change.
3. Include boundary and malformed-input cases where relevant, not only happy paths.
4. Prefer Web Platform APIs available in Workers over Node-only APIs unless `nodejs_compat` is intentionally required.
5. Validate request-derived input before using it in URLs, redirects, headers, upstream fetches, storage keys, or generated output.
6. Do not proxy arbitrary user-controlled URLs. Constrain outbound origins when fetching upstream resources.
7. Do not reflect untrusted input into headers without validation.
8. Guard against SSRF, response splitting, open redirects, cache poisoning, unsafe CORS, and unsafe URL schemes.
9. Return intentional status codes and content types.
10. Do not leak stack traces, credentials, internal IDs, environment values, or configuration details in responses.

## Cloudflare and Wrangler rules

`wrangler.jsonc` is the source of truth for persistent Worker configuration.

Current important settings include:

- Worker name: `vashfx-homepage`
- Worker entry point: `worker/index.ts`
- Compatibility date: `2026-09-02`
- Compatibility flag: `nodejs_compat`
- Assets directory: `./dist`
- Assets binding: `ASSETS`
- SPA not-found handling enabled
- Worker-first routes: `/api/*`
- Observability enabled
- Source-map upload enabled

When editing Cloudflare configuration:

- Make the smallest required change and preserve useful comments unless they are obsolete.
- Keep `compatibility_date` changes intentional. Do not bump it as drive-by maintenance because runtime behavior can change with compatibility dates.
- Re-run `npm run cf-typegen` after binding or runtime configuration changes.
- Prefer committed configuration in `wrangler.jsonc` over ad hoc CLI flags for persistent project behavior.
- Never store secret values in `wrangler.jsonc`, source files, tests, committed `.env` files, or committed `.dev.vars` files.
- Local secrets belong in ignored `.dev.vars` or `.env` files. Keep committed example files value-free.
- For deployed secrets, use Cloudflare secret mechanisms when explicitly requested.
- Do not run `npm run deploy` or `wrangler deploy` unless deployment is explicitly part of the task.
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
- changes to `allowScripts` that weaken package-install protections;
- GitHub Actions changes that broaden permissions or execute untrusted pull-request data in privileged contexts.

Do not disable or weaken CodeQL, Dependabot, lint rules, TypeScript checks, tests, GitHub Actions permissions, package-script protections, or other security controls merely to make a change pass.

If a security finding cannot be fixed within the requested scope, describe it clearly in the final response instead of silently accepting it.

## Dependencies

Before adding or changing a dependency:

1. Check whether the platform, React, Vite, or an existing dependency already provides the needed capability.
2. Prefer small, actively maintained packages with a clear purpose.
3. Avoid dependencies for trivial helpers.
4. Update `package.json` and `package-lock.json` together.
5. Review lifecycle/install scripts and the existing `allowScripts` policy.
6. Review transitive impact when the dependency is security-sensitive or unusually privileged.
7. Run the full required validation after dependency changes.

Do not perform unrelated dependency upgrades in the same patch unless explicitly requested.

## Tests

Worker tests use Node's built-in test runner with TypeScript stripping through the existing `npm test` script.

- Add regression tests when fixing bugs.
- Prefer deterministic tests without external network access.
- Test route boundaries, not only success paths.
- Do not make tests depend on production Cloudflare credentials or mutable remote resources.
- Keep tests focused on externally observable behavior.

For frontend changes without an existing browser test harness, validate with lint/build and reason carefully about accessibility, keyboard behavior, responsiveness, and user-visible regressions. Do not add a large testing framework unless the task warrants it.

## Generated and ignored files

The repository ignores local artifacts including:

- `node_modules/`
- `dist/`
- `dist-ssr/`
- `.wrangler/`
- `.dev.vars*` except `.dev.vars.example`
- `.env*` except `.env.example`
- common logs and editor-local files

Do not force-add ignored secret, build, Wrangler, or editor-local files.

`worker-configuration.d.ts` is committed generated output. Regenerate it with `npm run cf-typegen` when required instead of editing generated runtime types manually.

## GitHub Actions

The main CI workflow runs on Ubuntu with Node 24 and Node 26 and executes:

```sh
npm ci
npm run lint
npm test
npm run build
```

CodeQL separately scans the repository's configured languages/workflows.

When changing workflows:

- Keep permissions least-privileged.
- Prefer trusted official actions and intentional version upgrades.
- Avoid interpolating untrusted PR/issue content directly into shell commands.
- Do not switch privileged workflows to `pull_request_target` without a specific, security-reviewed reason.
- Preserve the Node 24/26 compatibility expectation unless the task intentionally changes supported versions.
- Treat dependency caching, artifact upload, and script execution as security-sensitive workflow behavior.

## Change completion checklist

Before reporting completion:

1. Review the final diff for unintended changes.
2. Confirm no secrets or local-only artifacts were added.
3. Run `npm run lint` when applicable.
4. Run `npm test` when applicable.
5. Run `npm run build` when applicable.
6. Run `npm run cf-typegen` when Cloudflare configuration or runtime types changed.
7. Confirm generated files are intentional.
8. Confirm dependency install-script permissions were not broadened unintentionally.
9. Confirm no deployment or remote Cloudflare mutation occurred unless explicitly requested.
10. Summarize what changed and list the validation commands actually run, including any failures or skips.
