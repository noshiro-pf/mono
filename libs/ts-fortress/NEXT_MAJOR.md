# Next major

- `t.number`'s `multipleOf` and `step` accept integers only.

    A fractional divisor such as `0.01` becomes a type error where it is written
    as a literal, and `t.number` throws when one reaches it at run time; the
    branded number constructors that pass these constraints on follow it. The
    remainder `value % divisor` is exact for an integer divisor, but a double
    such as `0.07` is not a multiple of `0.01` as a binary number, so a
    fractional divisor makes the check guess which decimal each value was
    written as (#4093 guesses it, and above about 15 significant digits several
    decimals share one double). Use `decimalPlaces` for "at most N decimal
    places", or `t.rational`, whose values and constraints are pairs of
    integers, for any other fractional multiple. A divisor that binary
    represents exactly, such as `0.5`, goes too, and moves to `t.rational`.
    Waits on both being released in a minor first (#4258); applying it also
    removes the fractional-divisor handling that #4093 adds to
    `src/primitives/number.mts`.

## Undecided

- Hide the `optional` marker of `Type<A>` behind a symbol.

    `optional?: true` is marked `@internal`, yet it is part of the published
    `Type<A>`, so code can read or set it. Phase 2 of
    `documents/implementation/update-reports/work-report-api-simplification-plan.md`;
    Phase 3 of the same plan was dropped in favor of exposing `shape` through
    `WithShape`, so whether Phase 2 still stands is open.
