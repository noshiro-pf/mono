---
'ts-std-forge': patch
'ts-data-forge': minor
---

Add `AsyncData<S, E>`, the state of data fetched asynchronously: `idle`, `pending`, or settled as the `Ok` / `Err` of `Result`. A pending or failed request keeps the latest success value as `previous`; `AsyncData.toPending` and `AsyncData.settle` move between the states and fill it in, and `AsyncData.isSettled` narrows a value to a `Result`. ts-data-forge re-exports it.
