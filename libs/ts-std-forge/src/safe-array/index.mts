// Hand-written, and named in `gi:src`'s `--preserve` list. Two things differ
// from the sibling modules, and `gi` is why both are possible here:
//
// - The namespace is declared in place. `safe-string/index.mts` and the rest
//   are generated, and `gi` emits only `export * from`, so their `export * as`
//   has to sit in a separate file for the generated barrel to re-export.
// - `./impl/index.mjs` is deliberately *not* re-exported beside it. The others
//   do that too, which puts the wrapper names at the package's top level
//   (`repeat`, `normalize`, ...); here it would collide, because `Regex`
//   already exports `create` and `CreateError` and `export *` reports an
//   ambiguous name as TS2308 rather than picking one.
//
// `SafeArray.create` is how the call site reads in any case — the ESLint rule
// that steers callers here writes it that way — so the namespace is the whole
// entry point.
export * as SafeArray from './impl/index.mjs';
