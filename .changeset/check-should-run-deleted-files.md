---
'ts-repo-utils': patch
---

`checkShouldRun`, `checkShouldRunTypeChecks` and the `check-should-run` / `check-should-run-type-checks` commands count a deleted file, and the old path of a renamed one, as changed, so a diff that only deletes or moves source no longer skips the gated step. `getDiffFrom` with `excludeDeleted: false` reports a rename under both its old and its new path.
