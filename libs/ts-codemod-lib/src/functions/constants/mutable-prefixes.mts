/**
 * The default `mutableVariablePrefixes` and `mutablePropertyPrefixes` of the
 * transformers: a name that starts with one of these is left mutable. A
 * private name (`#mut_x`) is matched with or after its `#`.
 *
 * The ESLint counterpart is `ignoredMutablePattern` in
 * `libs/eslint-config-typed/src/rules/eslint-functional-rules.mts` (and, for a
 * property, the `ignoreAccessorPattern` of `functional/immutable-data` there);
 * change them together.
 */
export const DEFAULT_MUTABLE_PREFIXES: readonly string[] = Object.freeze([
  'mut_',
]);
