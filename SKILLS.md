# SKILLS.md

## Purpose

This file describes the practical skills and repeatable workflows agents should use when working in this repository.

`AGENTS.md` remains the repository-wide policy and instruction source. Read it first. This file complements it by describing how to approach common classes of work in `vash-fiery/vashfx-homepage`.

A skill is a workflow, not permission to broaden scope. Use only the skills needed for the task, keep changes focused, and do not deploy or mutate remote Cloudflare resources unless the user explicitly requests it.

## Skill selection

Choose the smallest useful set of skills for the task.

Typical routing:

- React component or UI work → **Frontend React**, **Styling and accessibility**, then **Validation**.
- Worker/API work → **Cloudflare Worker/API**, **Worker testing**, then **Validation**.
- Wrangler or binding changes → **Cloudflare configuration**, **Cloudflare type generation**, then **Validation**.
- Dependency changes → **Dependency maintenance**, **Supply-chain review**, then **Validation**.
- GitHub Actions changes → **CI/workflow maintenance**, **Security review**, then **Validation**.
- Bug fixing → **Repository reconnaissance**, **Debugging**, the relevant implementation skill, **Regression testing**, then **Validation**.
- Documentation-only work → **Documentation maintenance** and a final diff review.

## Repository reconnaissance

Use this skill before making non-trivial changes or whenever repository behavior is unclear.

### Inspect

Start with the files closest to the requested change. Common anchors include:

- `AGENTS.md`
- `package.json`
- `package-lock.json`
- `src/`
- `worker/index.ts`
- `worker/index.test.ts`
- `vite.config.ts`
- `wrangler.jsonc`
- `worker-configuration.d.ts`
- `.oxlintrc.json`
- `.github/workflows/`
- `.github/dependabot.yml`

### Goals

- Understand current behavior before editing.
- Identify the smallest set of files that need to change.
- Find existing patterns before introducing new ones.
- Locate tests that define route, API, or runtime boundaries.
- Verify whether a file is generated before editing it manually.
- Check whether the task touches Cloudflare configuration, dependency install scripts, CI permissions, or secrets.

## Frontend React

Use for work under `src/`, React components, rendering logic, client-side behavior, and application structure.

### Current baseline

- React 19.2.x
- React DOM 19.2.x
- TypeScript 6.0.x
- Vite 8.2.x
- `@vitejs/plugin-react` 6.x

### Workflow

1. Read the component and its nearby styles/assets.
2. Preserve current component boundaries unless restructuring is necessary for the requested change.
3. Prefer typed props and simple render-time derivation over unnecessary effects or duplicated state.
4. Reuse existing dependencies and Web Platform APIs before adding packages.
5. Keep user-visible behavior accessible and responsive.
6. Run the required validation before completion.

### Guardrails

- Do not introduce `dangerouslySetInnerHTML` for untrusted or dynamic content.
- Do not create unsafe URL schemes such as `javascript:`.
- Do not move static assets between `public/` and `src/assets/` without understanding whether Vite should copy or bundle them.
- Do not add a large state-management or UI framework for a small feature.

## Styling and accessibility

Use for CSS, layout, responsive behavior, interaction states, and semantic markup.

### Workflow

- Prefer the existing stylesheet structure in `src/App.css` and `src/index.css`.
- Use semantic HTML before adding ARIA.
- Preserve keyboard operation and visible focus states.
- Check narrow and wide layouts after visual changes.
- Keep interactive controls as real buttons, links, inputs, and labels where appropriate.
- Avoid visual-only cues when state or meaning must also be available to assistive technology.

### Completion checks

For visual/frontend changes, verify at minimum:

- no obvious overflow or clipping;
- interactive elements remain keyboard reachable;
- focus indication remains visible;
- headings and landmarks remain sensible;
- links and buttons retain correct semantics;
- build output succeeds.

## Cloudflare Worker/API

Use for `worker/index.ts` and other Worker request-handling logic.

### Current routing contract

- Wrangler runs the Worker first for `/api/*`.
- Paths beginning with `/api/` are handled by the Worker.
- `/api` without the trailing slash is not currently an API route.
- `/apiary` and similar lookalike paths are not API routes.
- Non-API requests that reach the Worker return an empty `404` response.
- Static SPA assets are served from `dist` by the Cloudflare assets binding.

### Workflow

1. Read `worker/index.ts` and `worker/index.test.ts` together.
2. Keep route matching explicit.
3. Validate request-derived data before using it in URLs, headers, redirects, storage keys, upstream requests, or generated output.
4. Prefer Web Platform APIs available in Workers.
5. Add or update tests for every observable behavior change.
6. Test route boundaries and malformed input where relevant.
7. Return deliberate status codes and content types.

### Security checks

Review Worker changes for:

- SSRF and unrestricted outbound fetches;
- open redirects;
- header injection or response splitting;
- unsafe CORS;
- cache poisoning;
- unsafe URL schemes;
- secret or internal-data leakage;
- authorization assumptions on protected routes.

## Worker testing

Use for API behavior changes, Worker bug fixes, and route changes.

The repository uses Node's built-in test runner with TypeScript stripping through the existing npm script.

### Primary command

```sh
npm test
```

### Test style

- Prefer deterministic tests.
- Avoid external network dependencies.
- Assert externally observable behavior.
- Add regression tests for fixed bugs.
- Test boundaries, not only happy paths.
- Keep production credentials and mutable remote resources out of tests.

For route work, explicitly consider cases such as:

- intended `/api/...` route;
- `/api` boundary;
- lookalike prefixes such as `/apiary`;
- query strings;
- malformed or unsupported input;
- expected non-API `404` behavior.

## Cloudflare configuration

Use for `wrangler.jsonc`, runtime compatibility settings, assets configuration, bindings, observability, source maps, or Worker routing configuration.

### Current baseline

- Worker name: `vashfx-homepage`
- Entry point: `worker/index.ts`
- Compatibility date: `2026-09-02`
- Compatibility flag: `nodejs_compat`
- Assets directory: `./dist`
- Assets binding: `ASSETS`
- SPA not-found handling enabled
- Worker-first route: `/api/*`
- Observability enabled
- Source-map upload enabled

### Workflow

1. Read `wrangler.jsonc` and the code using affected bindings/runtime features.
2. Make the smallest persistent configuration change possible.
3. Preserve useful comments.
4. Do not bump `compatibility_date` as unrelated maintenance.
5. Run Cloudflare type generation when runtime typing assumptions change.
6. Review generated changes before committing them.
7. Run full validation.

### Remote-resource boundary

Do not change deployed routes, custom domains, account identifiers, secrets, production bindings, DNS, or other remote Cloudflare resources unless the task explicitly requests that mutation.

## Cloudflare type generation

Use whenever Worker bindings, compatibility flags, compatibility date, or runtime typing assumptions change.

### Command

```sh
npm run cf-typegen
```

### Workflow

1. Make the configuration change first.
2. Run `npm run cf-typegen`.
3. Review `worker-configuration.d.ts`.
4. Commit generated changes only when they reflect the intentional configuration change.
5. Never hand-edit generated sections to hide a configuration/type mismatch.

## Dependency maintenance

Use for `package.json`, `package-lock.json`, dependency upgrades, removals, or additions.

### Workflow

1. Check whether the platform or an existing dependency already provides the needed capability.
2. Avoid dependencies for trivial helpers.
3. Prefer actively maintained packages with a narrow purpose.
4. Change `package.json` and `package-lock.json` together.
5. Review lifecycle/install scripts.
6. Review transitive impact for privileged or security-sensitive packages.
7. Run lint, tests, and build.

Do not bundle unrelated dependency upgrades into another task.

## Supply-chain review

Use whenever dependency lifecycle scripts, package provenance, lockfile changes, or `allowScripts` are involved.

`package.json` contains an `allowScripts` policy. Treat it as a security control.

### Rules

- Do not broadly enable package lifecycle scripts.
- Do not add packages to `allowScripts` solely to make installation succeed.
- Identify why a new install script is required before allowing it.
- Review package provenance and the purpose of the script.
- Remove stale allowlist entries when they are no longer required.
- Check unexpected lockfile churn before accepting it.

## Debugging

Use when behavior is broken, validation fails, or the root cause is uncertain.

### Workflow

1. Reproduce or identify the failure from existing evidence.
2. Narrow the failing layer: frontend, Worker, configuration, dependency/tooling, or CI.
3. Read the nearest source and tests.
4. Fix the root cause instead of suppressing the signal.
5. Add a regression test when the bug has testable observable behavior.
6. Run the smallest relevant check first, then the full required validation.

### Never use these as fixes

- disabling lint rules to hide an error;
- weakening TypeScript settings without a real compatibility need;
- deleting tests that expose a regression;
- broadening CI permissions to make a workflow pass;
- bypassing package-script protections;
- swallowing exceptions without handling the underlying failure.

## Regression testing

Use after bug fixes or behavior changes.

A regression test should:

- fail for the original bug when practical;
- pass with the fix;
- describe externally visible behavior;
- avoid overspecifying internal implementation;
- include relevant boundary cases.

Worker regression tests belong in or alongside `worker/index.test.ts` unless the architecture changes enough to justify another location.

## CI/workflow maintenance

Use for files under `.github/workflows/` and dependency/security automation.

### Current CI expectation

The main Node workflow runs on Ubuntu with Node 24 and Node 26 and executes:

```sh
npm ci
npm run lint
npm test
npm run build
```

### Workflow rules

- Keep permissions least-privileged.
- Preserve Node 24/26 compatibility unless intentionally changing support.
- Prefer trusted official actions and intentional version updates.
- Treat artifact upload, caching, script execution, and token permissions as security-sensitive.
- Do not interpolate untrusted PR or issue data directly into shell commands.
- Do not switch privileged jobs to `pull_request_target` without a specific security-reviewed reason.
- Do not weaken CodeQL, Dependabot, or validation merely to obtain a green run.

## Security review

Use for any change that handles untrusted input, modifies dependencies, changes CI, touches Cloudflare configuration, or affects authentication/authorization boundaries.

Before completion, inspect the diff for:

- credentials, API keys, tokens, cookies, or personal data;
- `.env`, `.dev.vars`, Wrangler state, logs, or build output;
- XSS or unsafe HTML rendering;
- command, path, template, URL, header, or query injection;
- SSRF;
- open redirects;
- unsafe CORS;
- secret leakage through logs, responses, source maps, or client bundles;
- overly broad GitHub Actions permissions;
- suspicious or unnecessary dependency install scripts;
- accidental weakening of `allowScripts`.

Treat a security regression as a correctness bug.

## Documentation maintenance

Use for Markdown, comments, README material, agent instructions, and other non-executable documentation.

### Workflow

- Keep documentation consistent with current repository behavior.
- Prefer commands that already exist in `package.json`.
- Do not document deployment or configuration behavior that the repository does not actually use.
- Update adjacent documentation when a behavior change would otherwise leave instructions stale.
- Avoid copying version numbers into many files unless they provide real operational value.
- Review the final diff for accidental executable changes.

Documentation-only changes may skip executable validation when appropriate, but the final response should state what was skipped and why.

## Validation

Use after executable code, configuration, dependency, generated-type, or tooling changes.

### Required commands

```sh
npm run lint
npm test
npm run build
```

Run `npm run cf-typegen` additionally when Cloudflare runtime configuration or typing assumptions changed.

### Validation order

A useful default sequence is:

1. the smallest targeted check while iterating;
2. `npm run lint`;
3. `npm test`;
4. `npm run build`;
5. `npm run cf-typegen` when required;
6. final diff/security review.

Do not claim validation passed unless the commands were actually run successfully.

## Deployment

Use only when the user explicitly asks to deploy.

The repository exposes:

```sh
npm run deploy
```

Deployment is a remote mutation. Before running it:

1. complete the required validation;
2. confirm generated output is intentional;
3. review the target Cloudflare configuration;
4. confirm no secrets or local-only files are being committed or bundled unexpectedly;
5. deploy only within the scope explicitly requested.

Do not treat a normal code or documentation task as implicit deployment approval.

## Completion workflow

Before reporting any completed change:

1. Review the final diff.
2. Confirm the patch is limited to the requested scope.
3. Confirm no secrets or local-only artifacts were added.
4. Run the validation required by the type of change.
5. Confirm generated files are intentional.
6. Confirm `allowScripts` was not broadened unintentionally.
7. Confirm no remote Cloudflare mutation occurred unless explicitly requested.
8. Summarize the files changed and the behavior or documentation added.
9. List validation commands actually run, including failures or intentional skips.
