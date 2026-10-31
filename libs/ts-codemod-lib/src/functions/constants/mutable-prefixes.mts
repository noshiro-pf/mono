/**
 * The default `mutableVariablePrefixes` and `mutablePropertyPrefixes` of the
 * transformers: a name that starts with one of these is left mutable. A private
 * name (`#mut_x`) is matched with or after its `#`.
 *
 * The ESLint counterpart is `mutablePrefix` in
 * `libs/eslint-config-typed/src/constants/mutable-prefix.mts`, from which
 * `eslint-functional-rules.mts` there builds its name and property patterns;
 * `libs/eslint-config-typed/src/rules/eslint-functional-rules.test.mts` fails
 * when the two differ; it reads this package's `dist/`, so build first.
 */
export const DEFAULT_MUTABLE_PREFIXES: readonly string[] = Object.freeze([
  'mut_',
]);

/**
 * The default `mutableTypePrefixes` of the transformers: a type alias, an
 * interface or a class whose name starts with one of these is left mutable, and
 * `append-as-const` adds no `as const` where the value has to be assignable to
 * it (an annotated variable, `satisfies`, an arrow's return).
 * `Mutable` suits the PascalCase of type names; `mut_` is accepted as for
 * variables. No ESLint rule reads type names, so there is no counterpart to
 * keep in step.
 */
export const DEFAULT_MUTABLE_TYPE_PREFIXES: readonly string[] = Object.freeze([
  'Mutable',
  'mut_',
]);
