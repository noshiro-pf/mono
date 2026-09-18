---
'github-settings-as-code': minor
---

`backup` and `apply` now reject an environment or ruleset name that cannot be
used as a single file name, instead of joining it onto the output directory.
A name carrying `/`, `\` or a `\0`, and the names `''`, `.` and `..`, are
refused with an error naming the name and the directory; every other name is
written exactly where it was before.

Such a name used to fail partway through, with only the missing directory to
go on, or — where the directory did exist — resolve outside the one it was
given and be written there. `repo-settings/` holds the declarations that
`bk/` is compared against, so a backup able to reach them has nothing left to
compare against. Names without a separator, which is every name these
settings use, are unaffected.
