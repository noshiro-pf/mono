/**
 * The name prefix `functional/immutable-data` and `functional/no-let` let be
 * mutated (`eslint-functional-rules.mts`), and the one
 * `immer-coding-style/mut-prefixed-draft` asks of a draft. The codemod
 * counterpart is ts-codemod-lib's `DEFAULT_MUTABLE_PREFIXES`;
 * `eslint-functional-rules.test.mts` fails when the two differ.
 */
export const mutablePrefix = 'mut_';
