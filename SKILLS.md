# Repository Skills

This file maps common tasks in `vash-fiery/vashfx-homepage` to repeatable
playbooks. Read `AGENTS.md` first for repository-wide rules and validation
requirements. A task may use more than one skill.

## Skill selector

| Skill | Use when | Primary files | Required checks |
| --- | --- | --- | --- |
| `frontend-development` | Building or repairing UI, interaction, styling, or accessibility | `src/`, `public/`, `index.html` | `npm run lint`, `npm run build` |
| `worker-api-development` | Adding or changing `/api/` behavior | `worker/index.ts` | `npm run lint`, `npm run build` |
| `cloudflare-configuration` | Changing bindings, assets, compatibility, placement, or observability | `wrangler.jsonc`, `worker-configuration.d.ts` | Type generation, lint, build, deployment dry run |
| `worker-type-generation` | Refreshing or checking generated Cloudflare types | `wrangler.jsonc`, `worker-configuration.d.ts` | `npm run cf-typegen`, `npx wrangler types --check` |
| `dependency-maintenance` | Adding, removing, or upgrading npm packages | `package.json`, `package-lock.json` | `npm ci`, `npm run lint`, `npm run build` |
| `ci-maintenance` | Updating GitHub Actions, Dependabot, or labels | `.github/` | Syntax review plus the affected local checks |
| `documentation` | Updating Markdown or contributor guidance | `*.md` | Rendered Markdown, links, and command accuracy |

## `frontend-development`

Use this skill for React components, client-side behavior, CSS, and static
assets.

1. Trace the existing component and stylesheet before editing.
2. Keep the UI in `src/`; put files that must retain their public path in
   `public/` and imported build assets in `src/assets/`.
3. Preserve keyboard access, labels, semantic HTML, and meaningful image text.
4. Exercise affected interactions in local development when possible.
5. Run:

   ```sh
   npm run lint
   npm run build
   ```

For a visual change, include a before/after screenshot or explain why one is not
available.

## `worker-api-development`

Use this skill for Cloudflare Worker routes and response behavior.

1. Add specific route and method handling in `worker/index.ts`; do not weaken
   unrelated route behavior.
2. Validate input at the request boundary and return explicit HTTP status codes.
3. Keep response formats compatible unless a breaking change is requested and
   documented.
4. Use the generated `Env` type for Cloudflare bindings.
5. Run:

   ```sh
   npm run lint
   npm run build
   ```

If bindings also change, continue with `cloudflare-configuration`.

## `cloudflare-configuration`

Use this skill for `wrangler.jsonc`, including asset behavior, R2, Analytics
Engine, compatibility settings, placement, and observability.

1. Confirm the intended resource names and environments before changing a
   binding.
2. Edit `wrangler.jsonc`; never place secret values in the file.
3. Regenerate `worker-configuration.d.ts` rather than editing it directly.
4. Review both the concise configuration diff and the generated-type diff.
5. Run:

   ```sh
   npm run cf-typegen
   npx wrangler types --check
   npm run lint
   npm run build
   npx wrangler deploy --dry-run
   ```

Treat a real `npm run deploy` as a production action requiring explicit user
authorization.

## `worker-type-generation`

Use this skill when Wrangler configuration or tooling changes can alter Worker
types.

```sh
npm run cf-typegen
npx wrangler types --check
git diff -- worker-configuration.d.ts
```

Commit `worker-configuration.d.ts` when generation changes it. If it changes
unexpectedly, inspect the Wrangler version and `wrangler.jsonc` before accepting
the output.

## `dependency-maintenance`

Use this skill for npm dependency changes.

1. Verify why the package is needed and whether an existing dependency or Web
   API already covers the use case.
2. Use npm so `package.json` and `package-lock.json` remain synchronized.
3. Keep runtime packages in `dependencies` and build/test tooling in
   `devDependencies`.
4. Review install scripts and unexpected transitive changes before committing.
5. Run:

   ```sh
   npm ci
   npm run lint
   npm run build
   ```

When Wrangler or `@cloudflare/vite-plugin` changes, also run
`worker-type-generation` and the Cloudflare deployment dry run.

## `ci-maintenance`

Use this skill for files under `.github/`.

1. Preserve least-privilege workflow permissions and pin actions to deliberate
   versions.
2. Keep pull-request jobs free of production credentials and deployment side
   effects.
3. Match local commands to CI: installation uses `npm ci`, followed by lint and
   build on the supported Node.js matrix.
4. Check YAML structure and run every locally reproducible affected command.

Document any check that only GitHub Actions can complete.

## `documentation`

Use this skill for README files and repository guidance.

1. Confirm every command against `package.json` and every path against the
   current tree.
2. Prefer short examples and tables for exact mappings.
3. Keep headings descriptive and links stable.
4. Render the Markdown or inspect its preview, then verify links and code blocks.

Documentation-only changes do not require a full application build unless they
alter executable examples, configuration, or generated content.
