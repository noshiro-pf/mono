---
'ts-codemod-cli': patch
'ts-repo-utils': patch
---

`--version` reports the version of the package the command was installed from.

Every CLI in these packages now resolves its version from its own
`package.json` when it starts, rather than printing a string held in the
source. The value a command prints and the version a consumer installed are
the same thing by construction, so a release cannot move one without the
other.

`prepare-release` and `sync-cli-versions`, which carried the version into the
sources, are removed along with the string they maintained. Nothing else
called them.
