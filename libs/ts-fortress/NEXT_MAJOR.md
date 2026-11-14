# Next major

## Undecided

- Hide the `optional` marker of `Type<A>` behind a symbol.

    `optional?: true` is marked `@internal`, yet it is part of the published
    `Type<A>`, so code can read or set it. Phase 2 of
    `documents/implementation/update-reports/work-report-api-simplification-plan.md`;
    Phase 3 of the same plan was dropped in favor of exposing `shape` through
    `WithShape`, so whether Phase 2 still stands is open.
