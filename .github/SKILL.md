---
name: github-automation-maintenance
description: Safely maintain GitHub Actions workflows, Dependabot, labeler configuration, and related automation for vash-fiery/vashfx-homepage.
---

# GitHub Automation Maintenance

Use this skill for changes under `.github/`, especially GitHub Actions,
Dependabot, labeling automation, workflow permissions, triggers, secrets, and
release or deployment gates.

Read the repository-root `AGENTS.md` first, then the relevant sections of
`SKILLS.md`. Repository-wide security, Cloudflare, dependency, and validation
rules remain authoritative when they are stricter than this skill.

## Current automation

- `.github/workflows/node.js.yml` is the Cloudflare Worker CI/deploy workflow.
  It runs for pushes and pull requests targeting `main`, plus manual dispatch.
- Its build matrix uses Node.js 24 and 26, runs `npm ci`, `npm run lint`, and
  `npm run build`, and uploads `dist/` only on failure.
- Its deploy job runs only when the event is not `pull_request`, waits for the
  build matrix, uses Node.js 24, and deploys with `npm run deploy` using the
  `CLOUDFLARE_API_TOKEN` secret.
- `.github/workflows/codeql.yml` scans GitHub Actions and
  JavaScript/TypeScript on pushes and pull requests targeting `main`, plus its
  weekly scheduled run.
- `.github/workflows/labeler.yml` applies pull-request labels using
  `.github/labeler.yml`.
- `.github/dependabot.yml` checks npm and GitHub Actions dependencies daily in
  the `America/Chicago` timezone.

Re-read the files before editing them. This inventory describes the current
shape and must not be treated as a substitute for the checked-in configuration.

## Security contract

1. Treat issue text, pull-request content, branch names, commit messages,
   artifacts, logs, and other event-controlled values as untrusted input.
2. Keep workflow permissions at the least privilege required for the job. Do
   not grant write permissions globally merely because one job needs them.
3. Never expose, echo, upload, persist, or interpolate secret values into
   artifacts or logs. Keep production credentials out of pull-request jobs.
4. Never check out or execute an untrusted pull-request head from a privileged
   `pull_request_target` workflow. Prefer `pull_request` unless the privileged
   event is genuinely required.
5. Keep deployment gated away from pull-request events. A build or Wrangler dry
   run is validation, not authorization for a production deployment.
6. Treat changes to workflow permissions, secret access, third-party actions,
   dependency install scripts, artifact trust, and deployment behavior as a
   `security-review` task from the root `SKILLS.md`.
7. Do not weaken branch, CI, CodeQL, or deployment protections to make a failing
   change pass. Fix the cause or report the blocker.

## Workflow editing procedure

1. Identify every event that can start the workflow and whether it runs trusted
   base-repository code or contributor-controlled code.
2. Trace `permissions`, `if` conditions, environments, secrets, caches,
   artifacts, and outputs before changing steps.
3. Confirm each `run` command against `package.json` and preserve npm as the
   package manager with `package-lock.json` as the lockfile.
4. Keep action versions deliberate. Before upgrading an action, read its release
   notes and migration guidance, then inspect the resulting workflow diff for
   changed permissions, inputs, runtime requirements, or artifact behavior.
5. Keep expressions quoted or structured safely when YAML parsing could change
   their meaning. Avoid constructing shell commands from untrusted event data.
6. Prefer job-scoped permissions when only one job needs additional access.
7. Preserve the rule that pull requests build and validate but do not deploy.
8. Review the final diff for unintended trigger expansion, permission growth,
   secret exposure, remote writes, or new execution of untrusted code.

## Validation

For workflow changes, run every affected local command that CI runs and can be
reproduced safely:

```sh
npm ci
npm run lint
npm run build
git diff --check
```

When Cloudflare packaging or deployment configuration is affected, add:

```sh
npx wrangler deploy --dry-run
```

Do not run `npm run deploy`, `wrangler deploy`, `wrangler secret put`, or another
production write unless the user explicitly authorizes that operation.

If `actionlint` or another trusted YAML/workflow validator is already available,
use it for changed workflow files. Do not add a new dependency solely to claim
workflow syntax validation. GitHub-only checks such as CodeQL must be reported
as pending until GitHub Actions actually runs them.

## Playbooks

### Cloudflare Worker CI/deploy

Use for `.github/workflows/node.js.yml`.

- Keep pull-request validation on `main` aligned with the local npm scripts.
- Preserve Node.js 24 and 26 in the build matrix unless a runtime policy change
  is explicitly requested and compatibility has been verified.
- Keep deployment dependent on successful build jobs.
- Keep the deploy job excluded from pull-request events.
- Keep `CLOUDFLARE_API_TOKEN` scoped to the deploy step or job that requires it.
- If the deployment command, Wrangler version, bindings, or compatibility
  behavior changes, also use the root `cloudflare-configuration` and
  `worker-type-generation` playbooks.

### CodeQL

Use for `.github/workflows/codeql.yml`.

- Preserve analysis for `actions` and `javascript-typescript` unless the
  repository language surface changes.
- Keep `security-events: write` limited to the analysis job and retain only the
  read permissions CodeQL needs.
- Review CodeQL action upgrades for supported runner/runtime changes and query
  behavior before updating versions.
- Do not replace a failing security scan with exclusions merely to obtain a
  green check.

### Dependabot

Use for `.github/dependabot.yml`.

- Keep npm and GitHub Actions ecosystems separate so updates remain reviewable.
- Preserve the intended schedule and timezone unless the user asks to change
  update cadence.
- Treat Dependabot pull requests as dependency-maintenance work: review release
  notes, lockfile changes, install scripts, action permissions, and affected CI.
- Do not auto-merge security-sensitive dependency or action upgrades without an
  explicit repository policy authorizing it.

### Labeler

Use for `.github/labeler.yml` and `.github/workflows/labeler.yml`.

- Keep label patterns narrow enough to avoid surprising unrelated pull
  requests.
- Ensure the workflow requests only the pull-request or issue permissions it
  actually needs.
- Test changed glob intent against representative repository paths before
  handing off the change.

## Pull-request handoff

For `.github/` changes, report:

1. Which triggers, jobs, permissions, secrets, or dependency-update behavior
   changed.
2. Whether contributor-controlled input can reach a shell, action input,
   artifact, cache, or privileged job.
3. The exact local validation commands run and their results.
4. Any GitHub-hosted checks still pending, including CodeQL.
5. Whether the change can affect production deployment and what gate prevents a
   pull request from deploying.

Never describe an unrun check as passing.