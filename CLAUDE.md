# CLAUDE.md

Read **[README.md](./README.md)** and **[DEPLOYING.md](./DEPLOYING.md)** before
changing anything. They are the project's rules; this file only summarises them.
If the two disagree with this file, they win.

## Workflow

- Install with `npm ci`, never `npm install`. Run locally with `npm run dev`.
- Work on `main`. Pushing `main` deploys to staging (https://simpliaspain.github.io).
- Promote only after staging looks right:
  `git switch production && git merge main --ff-only && git push origin production`.
  If `--ff-only` refuses, investigate; never force it.
- Do not push, promote or force-push unless the user asks.

## Rules

- **Never build and publish by hand.** CI does every deploy. Do not use
  `npm run deploy`.
- **Never create `public/404.html`.** `postbuild` generates `dist/404.html` from
  the built output.
- **Keep `postbuild` portable.** It runs on `ubuntu-latest`; no shell-specific
  commands.
- **Leave `.gitattributes` alone.** It pins `CNAME` to LF.
- **One lockfile only:** `package-lock.json`, kept in sync with `package.json`.
- **If a deploy guard fails, fix the cause.** Never weaken a guard.
- Client-side routes returning HTTP 404 with correct content is expected, not a bug.
- Rollback procedure is in DEPLOYING.md; pushing to `gh-pages` directly is not.

## Commit style

- Subject in English, imperative, short, no trailing period:
  `Remove the last section eyebrow label`.
- Body explains what changed, why, and how it was verified (measurements,
  test runs, what was not checked). Wrap at ~72 columns.
- One logical change per commit.
