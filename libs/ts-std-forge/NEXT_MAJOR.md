# Next major

## Undecided

- Rename `match`, for example to `matchTag`.

    The current `match` looks a value up in a table of strings, and the name is
    wanted for structural pattern matching. The alternative is a structural
    matcher that extends `match` instead (`languages/sumi/docs/spec/stdlib.md`,
    "`match` の二重意味").

- Remove the curried overloads of `Optional.expectToBe`, `Result.expectToBe`
  and the like.

    Pass the arguments through `pipe(x).mapWith(fn, ...args)` instead of
    `pipe(x).map(fn(...args))`. Waits on `mapWith` being added to `pipe` here
    first (D-58, `languages/sumi/docs/overload-design.md`).

- Change the `$$tag` values from `'ts-data-forge::…'` to this package's name.

    They were kept when the implementation moved here, so that values from
    either package stayed interchangeable during the move (D-49). Code that
    reads `$$tag` directly would have to follow.

- Move `expectType` to ts-type-forge.

    It is a development utility both ts-std-forge and ts-data-forge use
    (D-49, open question (b)). Import it from `ts-type-forge` instead.
