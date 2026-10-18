# Public source synchronization

The public repository is `chentaichun/space-tower-defense-ios`. Its `main` branch contains the current cross-platform game. The existing `codex/ios-cloud` branch retains its independently staged iOS build; do not overwrite it during routine source synchronization.

## Update procedure

1. Finish changes in the playable source directory and run the applicable checks. Run `npm test` for a full regression baseline and report any existing failures accurately.
2. Fetch the public checkout and fast-forward its `main` branch. Review local changes before overwriting anything.
3. From the playable source directory, run `node tools/sync-public-source.mjs PATH_TO_PUBLIC_CHECKOUT`. This copies an explicit source allowlist, scans for known credentials, preserves source bytes and writes SHA-256 hashes to `source-snapshot.json`. It does not commit, push or deploy.
4. Inspect `git diff --stat` and the changed files in the public checkout. Run a credential scanner, for example `gitleaks dir PATH_TO_PUBLIC_CHECKOUT --redact`. Do not ignore real credentials; remove them from the public snapshot first.
5. Run `node tools/sync-public-source.mjs PATH_TO_PUBLIC_CHECKOUT --check`. Zero differences confirm the included source matches the playable project.
6. Stage and commit the reviewed files, then `git push origin main`. Never force-push. Confirm the remote commit and public README before reporting completion.

The staging command stops if the destination is dirty. After reviewing the changes, `--update-reviewed` permits refreshing an existing staging pass.

## Contents and exclusions

Included: game HTML/CSS/JavaScript, assets, Android and iOS native source, ranked Worker, API functions, database migrations, tests, development/build tools and public project documentation.

Excluded: administrator keys, signing keys, credential backups, environment secrets, dependency installations, local SDK paths, caches, build outputs, private reports and operational records. Firebase client configuration and public ad identifiers are client-visible configuration, not server credentials. Configure server secrets separately in the deployment environment.

The version of the source snapshot is not a claim that every feature is released in an app store. Android and iOS versions are recorded independently. The checked-in iOS `public/index.html` preserves the independently staged version for regression checks; use the original iOS branch for that release's full payload. Preparing a new iOS release is a separate versioning and validation task.

GitHub synchronization does not deploy production services or submit store builds.
