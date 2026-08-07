# Deploying

This site is a Vite + React SPA published to GitHub Pages by CI. Two branches
drive two environments:

| Branch       | Workflow              | Publishes to                          | URL                             |
| ------------ | --------------------- | ------------------------------------- | ------------------------------- |
| `main`       | `deploy-staging.yml`  | `simpliaspain/simpliaspain.github.io` | https://simpliaspain.github.io  |
| `production` | `deploy-prod.yml`     | `gh-pages` branch of this repo        | https://www.simpliaspain.com    |

Never build and publish by hand. CI performs every deploy.

## Normal workflow

1. Edit on `main` and commit.
2. Push:

   ```
   git push origin main
   ```

3. Wait for **Deploy to staging** to go green, then check
   https://simpliaspain.github.io and confirm your change looks right.
4. Promote to production:

   ```
   git switch production
   git merge main --ff-only
   git push origin production
   ```

5. Wait for **Deploy to production** to go green, then verify
   https://www.simpliaspain.com returns 200.

`--ff-only` is deliberate. If it refuses, `production` has diverged from `main`;
investigate rather than forcing the merge.

## Rollback

If a production deploy breaks the live site, restore the last known-good
`gh-pages` immediately:

```
git push origin gh-pages-backup:gh-pages --force
```

`gh-pages-backup` is the snapshot taken before the first CI cutover
(tag `live-2026-08-06`, commit `52e05b5`). This is the only sanctioned
force-push in this repo. GitHub Pages rebuilds within about a minute.

After any rollback, fix the problem on `main`, verify on staging, and promote
again — do not push directly to `gh-pages`.

## Guards

`deploy-prod.yml` fails the build rather than publishing a broken site if:

- `dist/CNAME` is missing or is not exactly `www.simpliaspain.com`. Publishing
  without it would detach the custom domain from the live site.
- `dist/404.html` is missing, or is the unbuilt entry rather than build output.

`deploy-staging.yml` deletes `dist/CNAME` and forces
`robots.txt` to `Disallow: /`, then asserts both. Two repositories claiming
`www.simpliaspain.com` would detach the domain from production, and staging
must never be indexed.

If a guard fails, fix the cause. Do not weaken the guard.

## Things that will bite you

**Never create `public/404.html`.** Vite copies `public/` verbatim, so that file
would publish the *unbuilt* `index.html` — the one still pointing at
`/src/main.tsx` — and every client-side route would break. The SPA fallback is
produced by the `postbuild` script, which copies the *built* `dist/index.html`
to `dist/404.html`.

**`postbuild` must stay portable.** It runs on `ubuntu-latest`. It once used
`copy`, a cmd.exe builtin, which failed every CI run before deploy. It is now
`node -e "require('fs').copyFileSync(...)"`. Do not replace it with a
shell-specific command.

**`.gitattributes` pins `CNAME` and `public/CNAME` to LF.** Without it, a
Windows checkout produces a CRLF `dist/CNAME`, and the production guard
`grep -qx 'www.simpliaspain.com' dist/CNAME` fails on the trailing `\r`. Leave
those rules in place.

**Client-side routes return HTTP 404 with correct content.** GitHub Pages serves
`404.html` with a 404 status, and the SPA then renders the route. This is
expected Pages behavior for both staging and production, not a regression.

**`package-lock.json` is the single source of truth.** Both workflows run
`npm ci`, which requires the lockfile to stay in sync with `package.json`. Do not
add a second lockfile.

## Token rotation

`deploy-staging.yml` authenticates to `simpliaspain.github.io` with the
`STAGING_DEPLOY_TOKEN` repository secret — a fine-grained PAT created by the
`simpliaspain` account, scoped to the `simpliaspain.github.io` repository only,
with Contents: Read and write.

**It expires 90 days after creation** (set 2026-08-07, so it lapses around
2026-11-05). When it does, staging deploys fail to authenticate while production
is unaffected — `deploy-prod.yml` uses the built-in `GITHUB_TOKEN`.

To rotate: the `simpliaspain` account creates a new fine-grained PAT with the
same scope, then updates the secret at
`Settings → Secrets and variables → Actions → STAGING_DEPLOY_TOKEN`. The token
must never be committed or written to disk. Never substitute a classic PAT — its
scope is far broader than this deploy needs.

Note that `admin` on this repository is limited to the `simpliaspain` account, so
secret changes and Pages settings must be done by that account.
