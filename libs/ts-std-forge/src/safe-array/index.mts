// Hand-written, and named in `gi:src`'s `--preserve` list so that `pnpm run
// gi` does not add `./impl/index.mjs` beside this line. Every other module
// here re-exports its `impl/` barrel as well, which puts the wrapper names at
// the package's top level too (`repeat`, `normalize`, ...). Doing that here
// would collide: `Regex` already exports `create` and `CreateError`, and
// `export *` reports an ambiguous name as TS2308 rather than picking one.
// `SafeArray.create` is how the call site reads in any case — the ESLint rule
// that steers callers here writes it that way — so the namespace is the whole
// entry point.
export * from './safe-array.mjs';
