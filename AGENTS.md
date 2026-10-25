# AGENTS.md

## Scope

These instructions apply to the entire repository unless a more deeply nested `AGENTS.md` or `AGENTS.override.md` provides more specific guidance.

This repository is the source for the VashFX homepage. The current UI is a React starter page with a counter and Worker API button. Treat changes with production care; repository configuration alone does not establish the live deployment state.

Read [SKILLS.md](SKILLS.md) for task-specific workflows. This file defines repository policy; `SKILLS.md` explains how to apply it.

## Current project baseline

The repository currently uses:

- React 19 + React DOM 19
- TypeScript 6
- Vite 8 with `@vitejs/plugin-react` 6
- Cloudflare Workers with `@cloudflare/vite-plugin`, Wrangler 4, and workerd
- Oxlint with React, TypeScript, and Oxc plugins
- Node.js built-in test runner
- npm with a committed `package-lock.json`

The CI matrix runs on Node 24 and Node 26. Changes must remain compatible with both versions unless the task explicitly updates the supported runtime matrix.

Read dependency ranges from [package.json](package.json) and resolved versions from [package-lock.json](package-lock.json). These can differ, and transitive packages can resolve to multiple versions. The major versions above are a repository baseline, not a substitute for checking those files. Avoid duplicating patch-version snapshots in agent documentation or performing drive-by upgrades.

`@openai/codex` and `eruda` are development dependencies. Neither is imported by the current frontend or Worker; the application has no OpenAI API integration or initialized Eruda console. Do not infer application features from development-tool dependencies.

## Repository map

| Path | Purpose |
| --- | --- |
| `src/` | React application source. |
| `src/main.tsx` | Browser entry point. |
| `src/App.tsx` | Primary application component. |
| `src/api.ts`, `tests/api.test.ts` | Client API request helper and regression tests. |
| `src/App.css`, `src/index.css` | Application styling. |
| `src/assets/` | Bundled application assets. |
| `public/` | Static public assets copied by Vite. |
| `worker/index.ts` | Cloudflare Worker request handler. |
| `worker/index.test.ts` | Worker unit tests using `node:test`. |
| `wrangler.jsonc` | Source of truth for persistent Cloudflare Worker configuration. |
| `worker-configuration.d.ts` | Committed generated Worker/runtime and binding types. |
| `vite.config.ts` | Vite and Cloudflare plugin configuration. |
| `package.json`, `package-lock.json` | npm scripts, dependency ranges, and resolved dependency state. |
| `tsconfig.json` | Project references for app, Node tooling, and Worker TypeScript configurations. |
| `.oxlintrc.json` | Lint configuration. |
| `.github/workflows/node.js.yml` | Node 24/26 validation; Cloudflare deployment job currently commented out. |
| `.github/workflows/codeql.yml` | CodeQL security scanning. |
| `.github/workflows/labeler.yml`, `.github/labeler.yml` | PR labeling workflow and path rules. |
| `.github/dependabot.yml` | Dependency update automation. |
| `SKILLS.md` | Task routing and repeatable workflows. |

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

## GitHub workflow and deployment boundary

- Inspect the working tree, current branch, applicable instructions, and relevant open PRs before editing. Preserve existing user changes and use a separate checkout when necessary.
- Start routine changes from the current target branch, normally `main`, and use a topic branch and pull request. Check for an existing relevant PR before creating another one.
- A push or merge to `main` triggers CI, including for Markdown-only changes. The deployment job is currently commented out in `.github/workflows/node.js.yml`; check the live workflow before any push or merge because it may be re-enabled later.
- The connected Cloudflare integration reports `Workers Builds: vashfx-homepage` independently of GitHub Actions. Its build/deploy settings are not defined by the commented Actions job. Report observed build, preview, and version results separately from verified production deployment; a successful build alone does not establish what is live.
- Use a topic branch and PR for routine code or documentation updates. Do not run `npm run deploy` or re-enable the CI deployment job without an explicit deployment request.
- Stage only intended files. Do not force-push, rewrite unrelated history, or overwrite concurrent changes to deliver an update.
- Verify the published branch or PR diff and report its link. Distinguish local validation results from GitHub checks that are still pending or failed.

## Install and development

Use the repository-local toolchain through npm scripts.

```sh
npm ci
npm run dev
```

Use `npm ci` for reproducible installs when `package.json` and `package-lock.json` are already synchronized. Use `npm install` only when intentionally changing dependencies or regenerating the lockfile.

Do not install Wrangler, Vite, TypeScript, Oxlint, Codex, or other repository tooling globally just to work on this project.

The scripts in `package.json` define the available commands:

| Command | Effect |
| --- | --- |
| `npm run dev` | Start Vite with the React and Cloudflare plugins. |
| `npm run lint` | Run Oxlint using `.oxlintrc.json`; this is not a TypeScript build check. |
| `npm test` | Run `node --test --experimental-strip-types tests/api.test.ts worker/index.test.ts`. |
| `npm run build` | Run `tsc -b && vite build`; check referenced TypeScript projects before bundling. |
| `npm run preview` | Build first, then run `vite preview` locally. |
| `npm run cf-typegen` | Run `wrangler types`. |
| `npm run deploy` | Build first, then run `wrangler deploy`; requires an explicit deployment request. |

### Dependency install scripts

`package.json` contains an `allowScripts` policy for selected dependency install scripts. Treat that allowlist as a supply-chain security control.

Compare allowlist entries with resolved dependency versions and packages marked `hasInstallScript` in `package-lock.json`, including nested workerd packages, when working on dependencies. A version-specific entry can become stale after an upgrade. See [Maintenance drift to verify](SKILLS.md#maintenance-drift-to-verify) for the latest repository comparison. Verify enforcement by the active package-manager version before relying on the field to block scripts; its presence alone is not evidence that an install enforced it.

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

For documentation-only changes that cannot affect executable behavior, verify documented commands, paths, links, and behavior against their source files and run `git diff --check`. Lint, tests, build, and type generation may be skipped, but the final response must state exactly which checks were not run and why. Do not install dependencies just to check Markdown.

### Cloudflare type generation

Run:

```sh
npm run cf-typegen
```

whenever `wrangler.jsonc`, Worker bindings, compatibility flags, compatibility date, or Cloudflare runtime typing assumptions change, including relevant Wrangler/workerd upgrades. Compare the generated header with the resolved toolchain; unchanged configuration does not guarantee that generated runtime types remain current.

Generate types before the final lint/test/build pass so validation covers the resulting file. Review `worker-configuration.d.ts`, including its generation header and `Env`/`ASSETS` declarations. Commit it only when the generated types legitimately changed. Do not hand-edit generated sections to conceal a configuration/type mismatch.

## Documentation maintenance

Keep the three root documents aligned while preserving their distinct roles:

- `README.md` explains setup, application behavior, configuration, and deployment to contributors.
- `AGENTS.md` defines repository-wide instructions and validation requirements.
- `SKILLS.md` describes task-specific workflows and their sources of truth.

Verify claims against source files at the target commit. Prefer links to configuration and manifests over duplicate version snapshots. When retaining a drift note, name the files compared and refresh or remove it after the underlying state changes. Do not describe a dependency, environment variable, or commented workflow as an active application feature without finding its use.

### Environment configuration

The tracked root `.env` contains public `VITE_*` values. The current API button calls the literal same-origin path `/api/`; it does not use either configured API URL. The PWA and long-reply variables do not establish implemented features.

Treat `VITE_*` values as public client configuration. Keep credentials in ignored local secret files and authorized Cloudflare secrets. Before changing configuration, trace its consumers in `src/`, `worker/`, and tooling; update generated types when the change affects Worker environment typing.

## Preferred formatting

Use Vash Fiery's established style for documentation, reports, code examples, and requested rich previews. Apply application styling within the requested UI task's scope.

| Element | Preference |
| --- | --- |
| Container | Compact Tailwind/shadcn-style cards with rounded corners and visible borders. |
| Card padding | `0px`. |
| Headers | Muted header/panel backgrounds and compact spacing. |
| Tables | Colorized cells or accents where supported; keep meaning available through text labels. |
| Typography | Monospace values and code; a small, readable code font. |
| Code | Language-aware syntax highlighting with selectable, copyable source. |
| Overflow | Horizontal scrolling for wide tables and long code lines. |

For supported rich output, use the theme tokens `--viz-card`, `--viz-panel`, `--viz-border`, `--viz-text`, `--viz-muted`, and `--viz-series-*` consistently. Keep tables and code as text rather than SVG/image-only replacements.

In repository Markdown, use compact native tables, inline code for commands/paths/values, and fenced code blocks with a language tag such as `sh`, `js`, `ts`, `json`, or `css`. GitHub controls rendered colors, font sizes, borders, and padding; reserve custom card styling for surfaces that support it. Preserve blank lines around tables, lists, headings, and code fences.

See [Formatting and presentation](SKILLS.md#formatting-and-presentation) for the workflow and completion checks.

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
- Preserve the API button's loading/disabled state and `unavailable` fallback in `src/App.tsx` unless the task changes that behavior. Keep the HTTP status check, string-name validation, and 10-second request/body timeout in `src/api.ts`.

## Worker and API guidance

The Worker entry point is `worker/index.ts`.

Current routing behavior is intentionally narrow:

- Wrangler runs the Worker first for `/api/*`.
- The Worker handles paths beginning with `/api/`.
- Matching requests return HTTP `200` with JSON `{ "name": "Cloudflare" }`. The handler currently does not restrict the HTTP method.
- `/api` without the trailing slash is not currently an API route.
- `/apiary` and other lookalike paths are not API routes.
- Non-API requests that reach the Worker return an empty `404` response.
- Static SPA assets are served from `dist` through the Cloudflare assets binding.

The exported `handleRequest` function is the unit-test entry point and is also used by the default Worker's `fetch` handler. Unit tests call it directly; they do not exercise Cloudflare's asset-routing layer. A handler `404` for `/` does not establish that the deployed homepage returns `404`.

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
- Compatibility date: `2026-09-09`
- `nodejs_compat` enabled through `compatibility_flags`
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
- The GitHub Actions deployment job is commented out, but the separate Workers Builds integration remains active. Check the integration's target and build/deploy settings for deployment work; do not infer deployment behavior solely from workflow YAML.
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

Client API and Worker tests use Node's built-in test runner with TypeScript stripping through the existing `npm test` script. Stripping types is not type checking; keep `npm run build` in executable-change validation. These are request-helper and handler unit tests, not a browser or workerd integration suite.

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
- untracked `.env*` files except `.env.example`
- common logs and editor-local files

Do not force-add ignored secret, build, Wrangler, or editor-local files.

The tracked root `.env` currently contains public Vite configuration. Keep it free of secrets and local-only values; `.gitignore` does not protect files that are already tracked.

`worker-configuration.d.ts` is committed generated output. Regenerate it with `npm run cf-typegen` when required instead of editing generated runtime types manually.

## GitHub Actions

The main CI workflow runs on Ubuntu with Node 24 and Node 26 and executes:

```sh
npm ci
npm run lint
npm test
npm run build
```

The workflow runs for pushes to `main`, pull requests targeting `main`, and manual dispatch. The deployment job is currently commented out, so none of these events deploy through this workflow. If that job is re-enabled, its commented condition limits it to pushes to `main` after the build matrix succeeds.

CodeQL scans `javascript-typescript` and `actions` on pushes, pull requests, and its weekly schedule. Dependabot checks npm and GitHub Actions dependencies daily.

The labeler uses `pull_request`, with `contents: read`, `pull-requests: write`, and `issues: write`. Its checkout step is commented out; the active step runs `actions/labeler` with `.github/labeler.yml`. Treat PR data as untrusted and account for restricted fork/Dependabot tokens when diagnosing labeling failures. Do not switch to `pull_request_target` simply to bypass a token-permission failure; any deliberate privileged workflow must use trusted base-repository configuration and must not check out or execute PR-head code.

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
2. Confirm no secrets or local-only artifacts were added or exposed through tracked environment files.
3. Run `npm run lint` when applicable.
4. Run `npm test` when applicable.
5. Run `npm run build` when applicable.
6. If Cloudflare configuration or runtime types changed, confirm `npm run cf-typegen` ran before the final lint/test/build pass.
7. Confirm generated files are intentional.
8. Confirm dependency install-script permissions were not broadened unintentionally.
9. Confirm no deployment command or remote Cloudflare configuration change was made unless explicitly requested. Check the live workflow before publishing to `main`, and report observed Workers Builds results separately from verified production deployment.
10. Run `git diff --check`, verify the branch/PR diff, and summarize what changed with the validation commands actually run, including failures or skips.
