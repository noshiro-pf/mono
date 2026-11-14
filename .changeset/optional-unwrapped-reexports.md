---
'ts-fortress': major
'ts-repo-utils': major
---

The `Result` re-exported from ts-data-forge now comes from ts-data-forge 15, whose `Optional` is unwrapped at runtime: `Result.toOptional` returns, and `Result.fromOptional` takes, an `Optional` whose `Some` is the value itself, with no `value` or `$$tag` property. Read the value with `Optional.unwrap` (from ts-data-forge or ts-std-forge) instead of `.value`.
