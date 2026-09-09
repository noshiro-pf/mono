---
'@sumi-lang/oxlint-config': patch
'@sumi-lang/conformance': patch
'@sumi-lang/cli': patch
---

Adopt `@sumi-expect-error` in `sumi check`, with `@ts-expect-error` semantics.

The marker existed only inside the conformance corpus, where it states the
diagnostic a fixture must produce. On user code `sumi check` did not read it
at all: it suppressed nothing, and — the half that matters — it reported
nothing when the diagnostic it names had stopped appearing. D-51 chose the
spelling precisely so the two would behave alike, and left adopting it for
user code open; this closes that.

`sumi check` now suppresses the lint diagnostic a marker names on the line it
applies to, and reports `unused @sumi-expect-error` (exit 1) for a marker
nothing answered. That is what separates it from an `oxlint-disable` comment,
which goes stale silently once the code around it is fixed.

Both engines are covered in one pass — the oxlint preset and the type-aware
checker (D-54) report into the same neutral vocabulary, and which of them
answered a marker is not something the marker can say.

Only lint diagnostics are covered. A compiler error already has
`@ts-expect-error`, which TypeScript checks for staleness the same way, and
two comments for one job would only raise the question of which one applies.

The parser moves from `@sumi-lang/conformance` to `@sumi-lang/oxlint-config`
so that the corpus and the CLI share one implementation — one spelling and one
meaning cannot survive two parsers. The neutral-ID normalization (`toRuleId`)
moves with it for the same reason; it was a private helper in the corpus test.
