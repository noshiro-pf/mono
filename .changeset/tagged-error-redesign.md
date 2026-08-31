---
'ts-std-forge': minor
---

Redesign wrapper failures as validate-first tagged unions (BREAKING: every wrapper's `Err` payload changes shape, and `SafeString.normalize` no longer returns a `Result`):

- Every wrapper now validates the ECMAScript-specified throw condition up front (mirroring the spec's ToIntegerOrInfinity coercion and check order) and returns a plain tagged error — e.g. `{ kind: 'radix-out-of-range', radix: 37 }` — instead of `Err<Error>`, so callers branch on `kind` rather than on engine-specific messages.
- Throws the spec leaves implementation-defined (e.g. `repeat` exceeding the engine string-length limit) surface via the shared `UnexpectedError` fallback `{ kind: 'unexpected', cause }`; `Regex.create` keeps the engine's `SyntaxError` as `cause` on its `'invalid-regexp'` kind.
- `SafeString.normalize` no longer returns a `Result`: its `form` union type excludes the only failure mode, so it is total and returns `string` directly.
- Each function exports its failure type alongside it (`SafeNumber.ToFixedError`, `Regex.CreateError`, …), and equivalence sweep tests pin the wrappers to the raw APIs' throw behavior over boundary inputs.
