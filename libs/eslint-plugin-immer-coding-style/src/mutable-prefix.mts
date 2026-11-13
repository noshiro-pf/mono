/**
 * The name prefix `immer-coding-style/mut-prefixed-draft` asks of a draft.
 * eslint-config-typed imports it as the prefix `functional/immutable-data` and
 * `functional/no-let` let be mutated, so that the two agree; its
 * `eslint-functional-rules.test.mts` also holds it to ts-codemod-lib's
 * `DEFAULT_MUTABLE_PREFIXES`.
 */
export const mutablePrefix = 'mut_';
