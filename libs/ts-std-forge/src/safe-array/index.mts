// Hand-written, like every other wrapper module's barrel, and named in
// `gi:src`'s `--preserve` list because `gi` emits only `export * from` and
// cannot write `export * as`.
//
// The namespace is the whole entry point: `./impl/index.mjs` is deliberately
// not re-exported beside it, which would also put the wrapper names at the
// package's top level. Two reasons. Generic names (`create`, `parse`,
// `repeat`, `normalize`) are not what this package's top level is for, and
// they collide across modules — `Regex.create` and `SafeArray.create` are
// both `create`, which `export *` reports as TS2308 rather than resolving.
export * as SafeArray from './impl/index.mjs';
