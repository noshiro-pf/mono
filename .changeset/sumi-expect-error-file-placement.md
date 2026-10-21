---
'@sumi-lang/cli': patch
'@sumi-lang/oxlint-config': patch
---

`@sumi-expect-error-file` now has to stand before the first code line (D-63): only comments, blank lines, a shebang and other markers may precede it. One placed below code is reported as an invalid marker and suppresses nothing, because it would read as covering only the lines after it.

`sumi check` now reports every comment that looks like a marker but is not one — malformed, applying to nothing, or a misplaced file-scoped marker — and fails on it; it used to drop them silently, leaving the diagnostic they meant with no word about why. An unused file-scoped marker is reported on its own line instead of line 0. `parseMarkers` returns its `problems` as `{ line, message }` and gives a file-scoped marker its own `markerLine`.
