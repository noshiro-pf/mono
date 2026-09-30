---
'ts-fortress': minor
---

Stop with a panic instead of a plain `Error`, and accept the reduced ISO 8601 forms in strict mode

`cast`, `assertIs` and the schema constructors that reject their arguments
(an invalid default value, `pick` / `omit` / `at` on a type they cannot read,
an expansion over its limit) now stop with ts-std-forge's `panic`. The thrown
value is still an `Error` with the same message — a `TypeError` where one was
documented — but it carries the panic mark, so `Result.fromThrowable` rethrows
it rather than turning it into `Err`. Code that wrapped `cast` or `assertIs`
in `Result.fromThrowable` to recover from invalid input should call
`validate` instead, which returns the `Result` directly.

`iso8601({ strict: true })` rejected `2009`, `2009-05` and `2009-W01`, because
an absent month or day was read as `0`. It now leaves the absent part
unchecked, as the non-strict mode and validator.js do.
