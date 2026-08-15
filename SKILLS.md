# SKILLS.md

## Purpose

This file contains repeatable, repository-specific playbooks. Choose the skill
that matches the task, then follow `AGENTS.md` and any more specific nested
instructions.

A skill is a procedure, not permission. Production deployment, secret changes,
remote-resource access, destructive actions, and unrelated edits still require
explicit authorization.

## Cloudflare retrieval rule

Cloudflare APIs, Wrangler commands, configuration fields, and platform behavior
change over time. Before changing Worker code or configuration:

1. Read the complete relevant project files.
2. Inspect `node_modules/wrangler/config-schema.json` for configuration fields.
3. Inspect generated or installed types for API and binding signatures.
4. Retrieve the current official documentation:
   - <https://developers.cloudflare.com/workers/best-practices/workers-best-practices/>
   - <https://developers.cloudflare.com/workers/wrangler/commands/>
   - <https://developers.cloudflare.com/workers/vite-plugin/>
   - <https://developers.cloudflare.com/workers/runtime-apis/bindings/>
   - <https://developers.cloudflare.com/workers/static-assets/>
   - <https://developers.cloudflare.com/workers/ci-cd/builds/configuration/>
   - <https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/>
   - <https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/>

Do not copy a remembered command, config field, limit, or API signature without
verification.

## GitHub retrieval rule

Before changing GitHub workflows, pull-request state, repository automation,
or deployment ownership:

1. Read the complete workflow and relevant repository configuration, including
   `.github/dependabot.yml`, `.github/labeler.yml`, and every affected file in
   `.github/workflows/`.
2. Inspect the current default branch, pull-request state, head SHA, and check
   runs through GitHub rather than relying on an earlier conversation.
3. Retrieve the current official documentation:
   - <https://docs.github.com/en/actions/reference/workflows-and-actions>
   - <https://docs.github.com/en/actions/reference/security/secure-use>
   - <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target>
   - <https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference>
4. Treat GitHub Actions jobs and external checks such as Workers Builds as
   separate systems with separate logs and credentials.

Use least-privilege workflow permissions, never place plaintext credentials in
workflow files, and do not assume secret redaction can repair an exposed value.
Treat `pull_request_target` as privileged: never check out an untrusted pull
request head or run pull-request-controlled code in that context.

## Skill map

| Skill | Use when | Primary paths |
| --- | --- | --- |
| Repository orientation | Establishing current structure, commands, and risk | root config and docs |
| Repository guidance maintenance | Updating agent instructions or playbooks from current repository evidence | `AGENTS.md`, `SKILLS.md` |
| Frontend UI | Building or changing React views and interactions | `src/` |
| Styling and responsive design | Changing layout, themes, typography, or motion | `src/*.css` |
| Worker API | Changing HTTP behavior under `/api/` | `worker/index.ts` |
| Wrangler and type synchronization | Changing bindings, compatibility, assets, observability, or environments | `wrangler.jsonc`, `worker-configuration.d.ts` |
| Cloudflare bindings | Reading or writing a configured Cloudflare resource | `worker/`, `wrangler.jsonc` |
| Dependency maintenance | Adding, removing, or upgrading npm packages | `package.json`, `package-lock.json` |
| Install-script review | Reviewing npm dependency lifecycle scripts | `package.json`, `package-lock.json` |
| Automated update review | Reviewing Dependabot npm or GitHub Actions pull requests | `.github/dependabot.yml`, bot PR files |
| Static assets | Adding images, icons, fonts, or public files | `src/assets/`, `public/` |
| Validation and review | Checking an implementation before handoff | changed files and npm scripts |
| CI workflow | Changing GitHub checks, permissions, or Node coverage | `.github/workflows/` |
| Workers Builds | Changing Cloudflare Git builds, previews, or deployment settings | `wrangler.jsonc`, Cloudflare settings |
| Deployment | Publishing an explicitly approved build to Cloudflare | `wrangler.jsonc`, build output |

## Repository orientation

Use this skill before a broad, ambiguous, or potentially deployment-sensitive
task.

1. Read `AGENTS.md`, `SKILLS.md`, `package.json`, `wrangler.jsonc`, and the
   relevant source files.
2. Read the affected files under `.github/` when the task can affect builds,
   security analysis, labels, dependency updates, or deployment behavior.
3. Confirm current dependency versions, npm scripts, binding names, generated
   types, and the default branch. Do not rely on an earlier conversation.
4. Check for an existing branch or pull request that already owns the scope.
   If it is closed and unmerged, do not reopen or continue it without explicit
   authorization; start replacement work from the current default branch.
5. Classify the work as frontend, Worker, configuration, dependency, CI,
   documentation, or deployment work and select the matching skill.

The skill is complete when the exact files, validation commands, deployment
risk, and write target are known.

## Repository guidance maintenance

Use this skill when updating `AGENTS.md`, `SKILLS.md`, or both.

1. Start from the current default branch. Check for an open pull request or
   branch already covering the same guidance before creating replacement work.
2. Inventory the complete repository tree and read both guidance files plus
   every project file needed to verify their claims. At minimum, inspect
   `package.json`, `wrangler.jsonc`, the relevant source entry points, and the
   affected files under `.github/`.
3. Separate stable operating rules from current-state snapshots. Re-verify
   versions, commands, bindings, branch names, triggers, permissions, and
   deployment ownership instead of copying them from an earlier conversation.
4. Check current official documentation for every platform behavior or command
   being added or changed.
5. Keep `AGENTS.md` authoritative for repository-wide constraints and
   `SKILLS.md` procedural. Remove contradictions and unnecessary duplication.
6. Add a playbook only when it is repeatable, repository-specific, and
   materially different from an existing skill. Update the skill map in the
   same change.
7. Review Markdown structure, tables, paths, commands, and links, then run
   `git diff --check`.
8. Use an `agent/<description>` branch and a pull request. Do not push guidance
   directly to `main`, because a `main` push can trigger production deployment.

Done means both files agree with each other and the current repository, every
new operational claim has a source, the diff is documentation-only, and the
deployment impact is stated.

## Frontend UI

Use this skill for React components, client-side state, events, navigation, or
browser API integration.

1. Inspect `src/App.tsx`, `src/main.tsx`, and related styles before changing
   component structure.
2. Keep components focused. Extract reusable UI or behavior when it improves
   clarity, validation, or maintenance.
3. Use typed props and state. Avoid `any`, unsafe assertions, and duplicated
   sources of truth.
4. Use semantic HTML and preserve keyboard access, visible focus, useful
   labels, and meaningful alternative text.
5. Keep client requests aligned with Worker routes, methods, status codes, and
   response shapes.
6. Verify the interaction with `npm run dev`.
7. Run `npm run lint` and `npm run build`.

Done means the requested behavior works and responsive, accessible, lint, and
build checks pass.

## Styling and responsive design

Use this skill for CSS, layout, visual hierarchy, light/dark themes, or motion.

1. Reuse custom properties in `src/index.css` before adding new colors, fonts,
   spacing values, or shadows.
2. Prefer stylesheet rules over inline styles.
3. Preserve light and dark color schemes.
4. Check narrow and wide viewports, overflow, contrast, keyboard focus, and
   reduced-motion behavior when animation is involved.
5. Keep selectors scoped enough to avoid unintended global changes.
6. Run `npm run lint` and `npm run build`, then inspect with `npm run dev` or
   `npm run preview`.

## Worker API

Use this skill for routes, request parsing, response handling, validation,
errors, or background work in the Cloudflare Worker.

1. Retrieve the latest Workers best-practices documentation and read
   `worker/index.ts`, `wrangler.jsonc`, and every client call to the endpoint.
2. Keep application routes under `/api/` unless the task intentionally changes
   the public routing contract.
3. Use module Worker syntax and `satisfies ExportedHandler<Env>`.
4. Handle supported methods explicitly and return stable JSON with appropriate
   status codes for invalid input, missing resources, and internal errors.
5. Keep request state per request. Never store request data or clients derived
   from bindings in mutable module-level state.
6. Await or otherwise deliberately handle every Promise. Use
   `ctx.waitUntil()` for post-response work and never destructure it from
   `ctx`.
7. Stream large or unknown-size bodies; buffer only bounded payloads.
8. Use bindings instead of Cloudflare REST calls for KV, R2, and Worker-to-
   Worker communication.
9. Use structured logs and do not expose secrets or internal error details in
   responses.
10. Exercise the happy path and at least one relevant failure path locally.
11. Run `npm run lint`, `npm run build`, and
    `npx wrangler deploy --dry-run`.

## Wrangler and type synchronization

Use this skill for bindings, compatibility dates or flags, asset routing,
module rules, environments, secrets declarations, observability, or generated
Worker types.

The current configuration declares no Cloudflare resource bindings and omits
`account_id`. Workers Builds selects its account and user token through
Cloudflare build settings.

1. Read the full `wrangler.jsonc`, the installed Wrangler schema, relevant
   Worker code, and `worker-configuration.d.ts`.
2. Verify every code binding exists in config and every configured binding is
   intentional. Names are exact and case-sensitive.
3. Preserve binding names unless the task includes the matching code and
   infrastructure migration.
4. Make the smallest configuration change and never put a secret value in
   `vars` or source control.
5. After any relevant change, run:

   ```sh
   npm run cf-typegen
   npx wrangler types --check
   npm run build
   npx wrangler deploy --dry-run
   ```

6. Review the generated `worker-configuration.d.ts` diff; do not hand-edit it.
7. Before changing `compatibility_date` or `compatibility_flags`, review the
   official compatibility changes and test affected behavior.
8. Keep observability enabled. Configure log or trace sampling deliberately
   and use structured application logs.
9. Keep `account_id` omitted unless a verified multi-account or routing issue
   requires it. A build-only account override belongs in
   `CLOUDFLARE_ACCOUNT_ID` in Cloudflare build settings, not source control.
10. Do not deploy, change secrets, use remote bindings, or mutate Cloudflare
   resources unless explicitly authorized.

Done means the config matches the schema, generated types match the config,
the build and dry run pass, and infrastructure or deployment impact is stated.

## Cloudflare bindings

Use this skill when implementing behavior with a configured Cloudflare
binding. The repository currently has none.

1. Confirm the exact binding in `wrangler.jsonc` and generated `Env` type.
2. Use the binding through `env`; do not add Cloudflare API credentials or call
   the REST API for a bound resource.
3. Apply the product-specific consistency, streaming, and error semantics from
   the current Cloudflare documentation.
4. Await every binding operation. For service bindings, also prevent
   accidental or unbounded recursive calls.
5. Local bindings are simulated by default. Use remote bindings only when the
   user authorizes the target resource and mutation risk.
6. Validate success, missing-data, invalid-input, and relevant failure paths.

## Dependency maintenance

Use this skill when adding, removing, or upgrading npm dependencies.

1. Use npm 11.19.0, matching `packageManager` in `package.json`.
2. Confirm whether the package belongs in `dependencies` or
   `devDependencies`.
3. Use npm commands so `package.json` and `package-lock.json` stay synchronized.
4. Review release notes, migration requirements, runtime support, peer
   dependencies, and engine constraints.
5. Inspect the lockfile for unexpected package churn, source changes, and
   integrity or engine changes.
6. Run `npm approve-scripts --allow-scripts-pending` and use the install-script
   review skill for every reported package.
7. Update code and configuration required by the new version.
8. Run `npm ci`, `npm run lint`, and `npm run build`.
9. For Wrangler, the Cloudflare Vite plugin, or Workers runtime changes, also
   run `npx wrangler types --check` and `npx wrangler deploy --dry-run`.
10. Report unresolved advisories, peer warnings, skipped scripts, and runtime
    compatibility concerns.

Do not hand-edit resolved versions or integrity hashes in
`package-lock.json`.

## Install-script review

Use this skill when npm reports dependency install scripts not covered by the
project's `allowScripts` policy.

1. List pending scripts without changing policy:

   ```sh
   npm approve-scripts --allow-scripts-pending
   ```

2. For each package, inspect the exact installed version, lifecycle command,
   source, lockfile resolution, purpose, and expected outputs.
3. Approve only named, reviewed packages with
   `npm approve-scripts <package>`. Deny a named package with
   `npm deny-scripts <package>` when its script is unnecessary or unsafe.
4. Prefer version-pinned approvals written by npm. Do not use `--all`, approve
   an unfamiliar package, or reverse a denial without explicit authorization.
5. Review the resulting `allowScripts` change in `package.json`, then run
   `npm ci`, `npm run lint`, and `npm run build`.
6. Report every package name and pinned version approved or denied.

The pending-list command is read-only. Approval and denial change project
policy and require an explicit package-by-package decision.

## Automated update review

Use this skill for a Dependabot pull request that updates npm packages or
GitHub Actions.

1. Read `.github/dependabot.yml`, the complete pull request, its base and head
   SHAs, changed files, and current check results.
2. Confirm whether the update is for `npm` or `github-actions`; keep unrelated
   ecosystems and independently opened bot pull requests separate unless the
   task explicitly combines them.
3. For npm updates, review release notes, engines, peers, lifecycle scripts,
   `package.json`, and the full lockfile diff. Use the dependency-maintenance
   and install-script-review skills, then run `npm ci`, `npm run lint`, and
   `npm run build`.
4. For GitHub Actions updates, review the action's official release notes,
   supported inputs, permission requirements, and changed reference. Read the
   complete affected workflow and preserve its security boundary.
5. Inspect GitHub Actions and Workers Builds checks separately. A green bot
   check or preview version is evidence, not permission to merge or deploy.
6. Do not edit a bot branch, approve an install script, merge the pull request,
   or enable auto-merge unless the user explicitly requests that action.

Done means the update scope and risk are understood, required checks pass, the
lockfile or action reference is internally consistent, and no deployment or
merge was performed without authorization.

## Static assets

Use this skill for images, icons, fonts, and SPA routing behavior.

1. Put imported, bundled assets in `src/assets/`.
2. Put files requiring stable root-relative URLs in `public/`.
3. Use descriptive names, avoid duplicates, and provide dimensions where they
   reduce layout shift.
4. Use meaningful alternative text for informative images and empty
   alternative text for decorative images.
5. Preserve `assets.not_found_handling: "single-page-application"` unless the
   task explicitly changes fallback behavior.
6. When changing Worker-first routing, retrieve the current static-assets docs
   and verify that `/api/*` reaches the Worker without breaking SPA navigation.
7. Check light/dark contrast and responsive rendering where relevant.
8. Run `npm run build` and inspect with `npm run preview`.

## Validation and review

Use this skill before handing off any implementation.

1. Review the complete diff and remove unrelated edits, debugging output,
   generated clutter, and stale comments.
2. Confirm tracked files contain no secrets or local environment values.
3. Run `git diff --check`.
4. Choose the validation set:

   | Scope | Commands and checks |
   | --- | --- |
   | Docs | Markdown, path, command, and link review |
   | Repository guidance | Current-tree evidence, cross-file consistency, official-source review, `git diff --check` |
   | Frontend | `npm run lint`, `npm run build`, focused UI check |
   | Worker | lint, build, local route checks, Wrangler dry run |
   | Config/bindings | type generation, `wrangler types --check`, build, dry run |
   | Dependencies | `npm ci`, script review, lint, build |
   | Workflow | YAML/event/permission review plus workflow command parity |
   | GitHub automation | Trigger privilege, untrusted-input boundary, Dependabot or label configuration, and expected behavior |

5. Verify both the SPA and affected `/api/` routes when work crosses the
   frontend/Worker boundary.
6. Report exactly which checks ran, which did not, and why.

The repository currently has no automated test script. Do not describe lint,
build, Wrangler checks, or manual verification as tests.

## CI workflow

Use this skill for GitHub Actions, Dependabot, label automation, or work that
affects build and deployment behavior.

1. Read complete workflow and configuration files. For the current repository,
   this includes `.github/workflows/node.js.yml`, `codeql.yml`, `labeler.yml`,
   `.github/dependabot.yml`, and `.github/labeler.yml` when relevant. Identify
   every trigger, matrix entry, permission, secret, condition, and deployment
   action.
2. Preserve reproducible installs with `npm ci` and npm caching.
3. The current build matrix uses Node.js 24 and 26 and runs
   `npm run build --if-present`.
4. Pull requests, pushes to `main`, and manual workflow dispatches build but
   never deploy from GitHub Actions. The commented deploy block is inert.
5. Workers Builds is the sole deployment owner. Do not uncomment the GitHub
   deploy block, add another deploy job, or add a Cloudflare token to GitHub.
6. CodeQL analyzes `actions` and `javascript-typescript` on pushes and pull
   requests to `main`, plus its scheduled weekly run. Preserve the intended
   language matrix and required `security-events` permission.
7. The labeler runs on `pull_request_target`. Preserve the base-repository
   checkout and never check out or execute the untrusted pull request head.
8. Dependabot checks npm and GitHub Actions daily in `America/Chicago` and
   assigns update pull requests to `vash-fiery`. Validate ecosystem names,
   directory paths, schedule fields, and intended assignees when editing it.
9. Apply least-privilege permissions. Do not assume every existing top-level
   permission is required by every job, and preserve exact label casing unless
   the task includes a label migration.
10. Never print `CLOUDFLARE_API_TOKEN` or other secret values.
11. Validate YAML structure and run the same local commands used by the
    workflow when practical.
12. Inspect GitHub Actions and external Workers Builds checks independently. A
   successful GitHub build does not imply a successful Cloudflare deployment.

## Workers Builds

Use this skill for the Cloudflare Git integration, production and preview
builds, build settings, or a failed Workers Builds check.

1. Treat Workers Builds as the only automated deployment system. GitHub
   Actions remains build-only even though its current display name is legacy.
2. Keep the production branch set to `main`. A production-branch push runs the
   configured build command followed by the deploy command.
3. Keep non-production branch behavior separate. When enabled, it must use the
   preview deploy command so a branch build uploads a preview version without
   promoting production.
4. Keep the Worker name aligned between `wrangler.jsonc` and Cloudflare.
5. Keep the build user token only in Cloudflare Settings > Build > API token.
   Never commit it, print it, or copy it into GitHub Actions.
6. Leave `account_id` absent unless the build log proves account selection is
   wrong. For error code `7003`, remove or correct a mismatched value or set
   `CLOUDFLARE_ACCOUNT_ID` in the Cloudflare build environment.
7. If the log reports a deleted, rolled, or stale token, create or select a
   valid user token in Build settings, save, and then retry. A retry uses the
   build configuration that exists when the retry starts.
8. Diagnose from evidence in this order: GitHub check status, Workers Builds
   check, Cloudflare build ID and log, Worker-name/account match, then token.
   Do not change application code for a pre-build authentication failure.
9. Before changing build or branch settings, record the existing production
   and preview commands and confirm the requested deployment impact.

Done means GitHub remains build-only, Workers Builds succeeds with the intended
account and user token, preview builds do not promote production, and no token
appears in repository content or logs.

## Deployment

Use this skill only when deployment is explicitly requested.

1. Confirm whether deployment is a Workers Builds push to `main` or an
   explicitly approved local Wrangler deployment. A manual GitHub workflow run
   does not deploy.
2. Confirm the Cloudflare account, Worker name, branch, and environment.
3. Confirm the change is approved and required validation has passed.
4. Review `wrangler.jsonc`, binding targets, compatibility settings, required
   secrets, and deployment-trigger conditions.
5. Run the preflight checks:

   ```sh
   npm run lint
   npm run build
   npx wrangler types --check
   npx wrangler deploy --dry-run
   ```

6. Production automation belongs to Workers Builds. Run `npm run deploy` only
   for an explicitly approved local deployment; never create a duplicate
   GitHub deployment path.
7. Remember that `wrangler secret put` and `wrangler secret delete` create and
   deploy a new version; treat them as deployment actions.
8. Record the deployment result, URL, version or commit, and warnings.
9. Smoke-check the homepage and relevant API routes.

Do not deploy merely to validate a change, and do not modify or remove an
existing production deployment unless explicitly requested.

## Adding a new skill

Add a section only when a workflow is repeatable and materially different from
the existing playbooks. Include:

- when it applies;
- files and systems it may change;
- an ordered procedure;
- required validation;
- permission and safety boundaries; and
- a concrete definition of done.

Keep new skills repository-specific and update the skill map in the same
change.
