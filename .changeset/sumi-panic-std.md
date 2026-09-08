---
'ts-std-forge': minor
---

Add `panic`, `unreachable` and `todo` (Sumi D-48): the panic path for a programming error. `panic(message, { cause? })` throws ts-data-forge's `PanicError`, `unreachable(value: never)` covers exhaustiveness checks and `todo(message?)` marks an unwritten path. All three are declared with explicit `never`-returning types so that a call terminates control flow.
