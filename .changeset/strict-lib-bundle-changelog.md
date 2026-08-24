---
'strict-ts-lib-v5.0-source': patch
---

Generate a `CHANGELOG.md` for each published strict standard library bundle.

The bundles are not private, so `changeset publish` releases them, and the
changesets action reads the changelog of every package whose version moved to
build the release notes. Their versions move on every release — the generator
rewrites those manifests after `changeset version` has bumped the harnesses —
but nothing ever wrote them a changelog, so the release failed before
publishing anything.
