---
'ts-type-forge': patch
---

`List.Zip` now reads optional elements and elements after a rest exactly: `Zip<[1, 2], [string, ...string[], number]>` has two required pairs, `Zip<[1, 2, 3], [string, string?]>` has no third pair and no `undefined` in the second, and `Zip<[1, 2?], string[]>` no longer ends in an unsized rest. A type correction: results only become more precise, and a pair that may be missing is still never required.
