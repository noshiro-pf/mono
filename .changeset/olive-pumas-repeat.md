---
'ts-repo-utils': minor
---

`getDiffFrom` now hands `base` to `git` as a single argument instead of building a command line out of it, and ends the revision list with `--`. The same holds for everything that passes a base through it: `formatDiffFrom`, `checkShouldRun`, `checkShouldRunTypeChecks`, and the `format-diff-from`, `check-should-run` and `check-should-run-type-checks` commands.

So `base` names exactly one revision. Whitespace and punctuation in it belong to the revision name rather than starting further arguments, a value git cannot resolve comes back as an `Err`, and the trailing `--` keeps a base that also matches a path in the working tree readable as a revision. A `base` beginning with `-` is rejected before git is invoked, because git would read it as an option.

This is a change for a caller that relied on a base being split into several git arguments: `getDiffFrom('HEAD~3 -- src/')` used to arrive at git as three arguments and is now one revision name, which git reports as an error.
