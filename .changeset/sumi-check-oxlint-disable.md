---
'@sumi-lang/cli': minor
'@sumi-lang/oxlint-config': minor
---

`sumi check` now reports an `oxlint-disable`, `oxlint-disable-line` or `oxlint-disable-next-line` comment that silences a rule of the Sumi preset, and fails on it: one that names no rule, or names a rule whose last segment is a preset rule's name (oxlint matches by that segment alone, so `foo/no-throw` silences `sumi(no-throw)`). Such a comment answered a Sumi diagnostic without `@sumi-expect-error`, which is meant to be the only way to (D-60). A comment naming only other rules is left alone. `@sumi-lang/oxlint-config` exports the scan as `findSumiSilencingDirectives`.
