---
'synstate-dom': minor
'synstate-router-dom': minor
---

`synstate-dom` exports `mountSwitch(value, keyOf, branch)`, the switch `If`, `MatchOptional` and `MatchResult` are built on: one branch at a time, rebuilt only when `keyOf` gives a different key. `synstate-router-dom`'s `Routes` now uses it instead of a copy of its own, which lacked the handling of updates that arrive before the switch is inserted: a navigation made by a component mounted after `Routes`, while the page was still mounting, was lost, and `Routes` kept showing the page it started on. `synstate-router-dom` now needs the `synstate-dom` release that exports `mountSwitch`: its peer range moves to that version, so update both together.
