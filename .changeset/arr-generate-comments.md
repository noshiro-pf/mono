---
'eslint-plugin-ts-data-forge': patch
---

`prefer-arr-generate` no longer applies its fix automatically when the rewrite would drop a comment that sits outside the callback (between the receiver and `.flatMap`, after `flatMap(`, or after the callback) or inside a test it negates (the negation can drop it, so any comment there now keeps the fix a suggestion). Such a rewrite is now offered as a suggestion, as one with any other dropped comment already was. A comment inside a destructured parameter is carried over, and no longer turns the fix into a suggestion.
