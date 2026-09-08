# SKILLS.md

## Purpose

This file describes the practical skills and repeatable workflows agents should use when working in this repository.

[AGENTS.md](AGENTS.md) remains the repository-wide policy and instruction source. Read it first. This file complements it by describing how to approach common classes of work in `vash-fiery/vashfx-homepage`.

This is a repository workflow catalogue, not an installable agent skill package. Use tools and installed skills that are actually available in the current environment; a workflow name here does not install or grant access to a plugin.

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
- Publishing repository changes → **GitHub delivery**, with validation appropriate to the changed files.
- Explicit deployment work → **Deployment**, after validation and target review.

## Repository reconnaissance

Use this skill before making non-trivial changes or whenever repository behavior is unclear.

### Inspect

Start with the files closest to the requested change. Common anchors include:

- `AGENTS.md`
- `SKILLS.md`
- `package.json`
- `package-lock.json`
- `src/`
- `worker/index.ts`
- `worker/index.test.ts`
- `vite.config.ts`
- `tsconfig.json` and its referenced configurations
- `wrangler.jsonc`
- `worker-configuration.d.ts`
- `.oxlintrc.json`
- `.github/workflows/`
- `.github/dependabot.yml`
- `.github/labeler.yml`

### Goals

- Understand current behavior before editing.
- Identify the smallest set of files that need to change.
- Find existing patterns before introducing new ones.
- Locate tests that define route, API, or runtime boundaries.
- Verify whether a file is generated before editing it manually.
- Check whether the task touches Cloudflare configuration, dependency install scripts, CI permissions, or secrets.
- Check the working tree, branch, current target commit, and relevant open PRs before editing or publishing.
- Read dependency ranges and resolved versions separately; do not copy a manifest range as the installed version.

### Maintenance drift to verify

At the 2026-09-08 review, the generated header in `worker-configuration.d.ts` recorded compatibility date `2026-08-29`, while `wrangler.jsonc` used `2026-09-02`. The lockfile also resolved workerd versions newer than the version-specific workerd entries in `allowScripts`.

Recheck these source files before a runtime or dependency task. Regenerate types or review install-script entries within that task's scope, then update or remove this note when resolved. Do not silently regenerate types or broaden script permissions during a documentation-only update.

## GitHub delivery

Use when committing or publishing repository changes.

1. Read the target branch and existing relevant PRs using the connected GitHub tools or authenticated Git.
2. Preserve local user work and base the patch on the current target commit.
3. Use a topic branch and stage only intended files.
4. Complete the validation required by the change and review the final diff.
5. Push the topic branch and open or update a PR targeting `main`. Verify the remote diff and report the PR link and known check status.

Every push to `main`, including a documentation-only merge, can deploy to Cloudflare after CI succeeds. Under `AGENTS.md`, a routine update request should be delivered through a PR; do not push or merge to `main` unless the deployment-affecting action is authorized. Do not force-push or overwrite concurrent work.

## Frontend React

Use for work under `src/`, React components, rendering logic, client-side behavior, and application structure.

### Sources of truth

Read the stack overview in [AGENTS.md](AGENTS.md#current-project-baseline), dependency ranges in `package.json`, resolved versions in `package-lock.json`, and plugin configuration in `vite.config.ts`. Avoid maintaining another version snapshot here.

### Workflow

1. Read the component and its nearby styles/assets.
2. Preserve current component boundaries unless restructuring is necessary for the requested change.
3. Prefer typed props and simple render-time derivation over unnecessary effects or duplicated state.
4. Reuse existing dependencies and Web Platform APIs before adding packages.
5. Keep user-visible behavior accessible and responsive.
6. Run the required validation before completion.

For the existing API button, preserve the loading/disabled state, the `response.ok` check, validation that `name` is a string, and the `unavailable` fallback. Exercise success and failure behavior when changing this interaction.

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
- Matching requests return HTTP `200` and JSON `{ "name": "Cloudflare" }`; the handler currently has no method restriction.
- `/api` without the trailing slash is not currently an API route.
- `/apiary` and similar lookalike paths are not API routes.
- Non-API requests that reach the Worker return an empty `404` response.
- Static SPA assets are served from `dist` by the Cloudflare assets binding.

`handleRequest` is exported for tests and is used by the default `fetch` handler. Keep this test seam unless the task deliberately changes the public module interface. Distinguish direct-handler responses from Cloudflare asset/SPA routing.

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

The repository uses Node's built-in test runner with TypeScript stripping through the existing npm script: `node --test --experimental-strip-types worker/index.test.ts`. Use the CI-supported Node 24/26 versions. This command executes tests without type checking; `npm run build` supplies the TypeScript project checks.

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

The current tests cover `/api/`, `/api/status?source=test`, `/`, `/api`, and `/apiary`, including JSON content type and response bodies. They do not cover browser interaction or the Cloudflare asset layer. For changes to SPA fallback, bindings, or Worker-first routing, supplement handler tests with local dev/preview checks of the affected URLs and report which runtime was exercised.

## Cloudflare configuration

Use for `wrangler.jsonc`, runtime compatibility settings, assets configuration, bindings, observability, source maps, or Worker routing configuration.

### Sources of truth

Read [wrangler.jsonc](wrangler.jsonc) for the Worker name, entry point, compatibility settings, assets, observability, and source-map configuration. The important settings and policy are summarized in [AGENTS.md](AGENTS.md#cloudflare-and-wrangler-rules). Read generated bindings from `worker-configuration.d.ts` and compare its header with the current configuration.

### Workflow

1. Read `wrangler.jsonc` and the code using affected bindings/runtime features.
2. Make the smallest persistent configuration change possible.
3. Preserve useful comments.
4. Do not bump `compatibility_date` as unrelated maintenance.
5. Run Cloudflare type generation when runtime typing assumptions change, before the final lint/test/build pass.
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
3. Review `worker-configuration.d.ts`, including its generation header and `Env`/`ASSETS` declarations, against the current configuration and resolved toolchain.
4. Commit generated changes only when they reflect the intentional configuration change.
5. Never hand-edit generated sections to hide a configuration/type mismatch.
6. Run lint, tests, and build after generation so the final checks include the generated file.

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

Use `npm ci` for an unchanged, synchronized manifest and lockfile. Use `npm install` for intentional dependency or lockfile changes. Review both direct and nested resolutions, especially Wrangler, the Cloudflare Vite plugin, and workerd, rather than assuming one shared runtime version.

Do not bundle unrelated dependency upgrades into another task.

## Supply-chain review

Use whenever dependency lifecycle scripts, package provenance, lockfile changes, or `allowScripts` are involved.

`package.json` contains an `allowScripts` policy. Treat it as a security control.

Compare the version-specific entries with lockfile packages marked `hasInstallScript`, including nested workerd resolutions. Verify how the active package-manager version enforces the policy; do not claim scripts were blocked merely because this field exists. If entries and resolutions differ, report the mismatch and review the affected scripts before changing the policy.

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

The main Node workflow runs on Ubuntu with Node 24 and Node 26 for pushes to `main`, PRs targeting `main`, and manual dispatch. It executes:

```sh
npm ci
npm run lint
npm test
npm run build
```

After successful matrix validation, the `deploy` job runs on Node 24 only when the event is a push to `main`. It builds and invokes `npm run deploy` with Cloudflare repository secrets. There is no documentation-only path exclusion. PR and manual-dispatch runs do not deploy under the current condition.

CodeQL scans `javascript-typescript` and `actions` on pushes, PRs, and its weekly schedule. Dependabot checks npm and GitHub Actions daily. PR labels come from `.github/labeler.yml` through the existing `pull_request_target` labeler workflow.

### Workflow rules

- Keep permissions least-privileged.
- Preserve Node 24/26 compatibility unless intentionally changing support.
- Prefer trusted official actions and intentional version updates.
- Treat artifact upload, caching, script execution, and token permissions as security-sensitive.
- Do not interpolate untrusted PR or issue data directly into shell commands.
- Do not switch privileged jobs to `pull_request_target` without a specific security-reviewed reason.
- Keep the existing privileged labeler limited to trusted base-repository checkout/configuration and labeling. Do not execute PR-head code or install PR-controlled dependencies in that workflow.
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
- Verify command descriptions against npm scripts, routing claims against both Worker code and Wrangler configuration, and CI/deployment claims against workflow triggers and job conditions.
- Verify relative Markdown links and referenced repository paths, and keep policy in `AGENTS.md` consistent with workflows in this file.
- Run `git diff --check` and confirm the diff contains only intended documentation files. No dependency installation is needed for this check.
- Review the final diff for accidental executable changes.

Documentation-only changes may skip `npm run lint`, `npm test`, `npm run build`, and `npm run cf-typegen` when executable inputs are unchanged. State those skips and the reason in the final response. Follow **GitHub delivery** because a documentation push to `main` still triggers deployment.

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
2. `npm run cf-typegen` when required;
3. `npm run lint`;
4. `npm test`;
5. `npm run build`;
6. `git diff --check` and final diff/security review.

Do not claim validation passed unless the commands were actually run successfully.

`npm run preview` runs a build before local preview. Use it when production-build behavior needs manual inspection. It is distinct from `npm run deploy`, which publishes remotely. There is no dedicated browser-test or typecheck npm script; use the actual scripts and report any additional checks precisely.

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

The other deployment path is a push or merge to `main`, which starts CI and can invoke the same deploy script after validation. Review this side effect before an authorized release. A topic-branch PR provides validation without meeting the workflow's deployment condition.

## Completion workflow

Before reporting any completed change:

1. Review the final diff.
2. Confirm the patch is limited to the requested scope.
3. Confirm no secrets or local-only artifacts were added.
4. Run the validation required by the type of change.
5. Confirm generated files are intentional.
6. Confirm `allowScripts` was not broadened unintentionally.
7. Confirm no remote Cloudflare mutation occurred unless explicitly requested, including automatic deployment from a push or merge to `main`.
8. Summarize the files changed and the behavior or documentation added.
9. List validation commands actually run, including failures or intentional skips.
10. Verify published changes and link the branch or PR. Report remote checks separately from local checks, and leave the PR unmerged when deployment was not authorized.
