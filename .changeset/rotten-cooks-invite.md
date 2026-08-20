---
'ts-repo-utils': minor
---

Add `checkShouldRun` and the `check-should-run` command: the general form of
`checkShouldRunTypeChecks`, which takes the ignored paths rather than assuming a
type check's. Use it to gate any CI step on the paths it actually reads —
preferable to a workflow-level `paths-ignore`, which stops the workflow from
reporting a status check at all.

`checkShouldRunTypeChecks` now delegates to it and keeps its default ignore
list. As a side effect its patterns are matched against repository-relative
paths, as documented; they were being matched against the absolute paths
`getDiffFrom` returns, so exact names (`LICENSE`) and directory prefixes
(`docs/`) never matched anything and only the extension patterns (`**.md`) took
effect. Patterns are matched with micromatch now, so ordinary globs work too.
