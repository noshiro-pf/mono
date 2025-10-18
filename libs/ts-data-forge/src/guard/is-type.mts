/**
 * Type guard that checks if a value is `undefined`.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input type to `undefined` when `true`
 * - Useful for explicit undefined checks
 *
 * @example
 *
 * ```ts
 * const values: (number | undefined)[] = [1, undefined, 2];
 *
 * const undefinedValues = values.filter(isUndefined);
 *
 * assert.deepStrictEqual(undefinedValues, [undefined]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is `undefined`, `false` otherwise. When `true`,
 *   TypeScript narrows the type to `undefined`.
 */
export const isUndefined = (u: unknown): u is undefined => u === undefined;

/**
 * Type guard that checks if a value is not `undefined`.
 *
 * **Type Narrowing Behavior:**
 *
 * - Excludes `undefined` from the input type when `true`
 * - Preserves all other types in the union
 * - Commonly used to filter out undefined values
 *
 * @example
 *
 * ```ts
 * const values: (number | undefined)[] = [1, undefined, 2];
 *
 * const definedValues = values.filter(isNotUndefined);
 *
 * assert.deepStrictEqual(definedValues, [1, 2]);
 * ```
 *
 * @template T - The type of the input value
 * @param u - The value to check
 * @returns `true` if `u` is not `undefined`, `false` otherwise. When `true`,
 *   TypeScript excludes `undefined` from the type.
 */
export const isNotUndefined = <T,>(u: T): u is RelaxedExclude<T, undefined> =>
  u !== undefined;

/**
 * Type guard that checks if a value is a boolean.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows `unknown` to `boolean` when `true`
 * - Preserves literal boolean types (`true | false`)
 *
 * @example
 *
 * ```ts
 * const flags: unknown[] = [true, 'no', false];
 *
 * const booleans = flags.filter(isBoolean);
 *
 * assert.deepStrictEqual(booleans, [true, false]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a boolean, `false` otherwise. When `true`,
 *   TypeScript narrows the type to `boolean`.
 */
export const isBoolean = (u: unknown): u is boolean => typeof u === 'boolean';

/**
 * Type guard that checks if a value is not a boolean.
 *
 * **Type Narrowing Behavior:**
 *
 * - Excludes `boolean` from the input type when `true`
 * - Preserves all other types in the union
 *
 * @example
 *
 * ```ts
 * const flags: unknown[] = [true, 'no', false];
 *
 * const nonBooleans = flags.filter(isNotBoolean);
 *
 * assert.deepStrictEqual(nonBooleans, ['no']);
 * ```
 *
 * @template T - The type of the input value
 * @param u - The value to check
 * @returns `true` if `u` is not a boolean, `false` otherwise. When `true`,
 *   TypeScript excludes `boolean` from the type.
 */
export const isNotBoolean = <T,>(u: T): u is RelaxedExclude<T, boolean> =>
  typeof u !== 'boolean';

/**
 * Type guard that checks if a value is a number.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows `unknown` to `number` when `true`
 * - Includes `NaN`, `Infinity`, and `-Infinity` as valid numbers
 * - Preserves literal number types when possible
 *
 * @example
 *
 * ```ts
 * const mixed: unknown[] = [1, '2', 3];
 *
 * const numbers = mixed.filter(isNumber);
 *
 * assert.deepStrictEqual(numbers, [1, 3]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a number, `false` otherwise. When `true`,
 *   TypeScript narrows the type to `number`.
 */
export const isNumber = (u: unknown): u is number => typeof u === 'number';

/**
 * Type guard that checks if a value is not a number.
 *
 * **Type Narrowing Behavior:**
 *
 * - Excludes `number` from the input type when `true`
 * - Preserves all other types in the union
 *
 * @example
 *
 * ```ts
 * const mixed: unknown[] = [1, '2', 3];
 *
 * const nonNumbers = mixed.filter(isNotNumber);
 *
 * assert.deepStrictEqual(nonNumbers, ['2']);
 * ```
 *
 * @template T - The type of the input value
 * @param u - The value to check
 * @returns `true` if `u` is not a number, `false` otherwise. When `true`,
 *   TypeScript excludes `number` from the type.
 */
export const isNotNumber = <T,>(u: T): u is RelaxedExclude<T, number> =>
  typeof u !== 'number';

/**
 * Type guard that checks if a value is a bigint.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows `unknown` to `bigint` when `true`
 * - Identifies values created with `BigInt()` constructor or `n` suffix
 *
 * @example
 *
 * ```ts
 * const values: unknown[] = [1n, 2, 3n];
 *
 * const bigints = values.filter(isBigint);
 *
 * assert.deepStrictEqual(bigints, [1n, 3n]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a bigint, `false` otherwise. When `true`,
 *   TypeScript narrows the type to `bigint`.
 */
export const isBigint = (u: unknown): u is bigint => typeof u === 'bigint';

/**
 * Type guard that checks if a value is not a bigint.
 *
 * **Type Narrowing Behavior:**
 *
 * - Excludes `bigint` from the input type when `true`
 * - Preserves all other types in the union
 *
 * @example
 *
 * ```ts
 * const values: unknown[] = [1n, 2, 3n];
 *
 * const nonBigints = values.filter(isNotBigint);
 *
 * assert.deepStrictEqual(nonBigints, [2]);
 * ```
 *
 * @template T - The type of the input value
 * @param u - The value to check
 * @returns `true` if `u` is not a bigint, `false` otherwise. When `true`,
 *   TypeScript excludes `bigint` from the type.
 */
export const isNotBigint = <T,>(u: T): u is RelaxedExclude<T, bigint> =>
  typeof u !== 'bigint';

/**
 * Type guard that checks if a value is a string.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows `unknown` to `string` when `true`
 * - Preserves literal string types when possible
 * - Includes empty strings
 *
 * @example
 *
 * ```ts
 * const values: unknown[] = ['Ada', 42, 'Lovelace'];
 *
 * const strings = values.filter(isString);
 *
 * assert.deepStrictEqual(strings, ['Ada', 'Lovelace']);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a string, `false` otherwise. When `true`,
 *   TypeScript narrows the type to `string`.
 */
export const isString = (u: unknown): u is string => typeof u === 'string';

/**
 * Type guard that checks if a value is not a string.
 *
 * **Type Narrowing Behavior:**
 *
 * - Excludes `string` from the input type when `true`
 * - Preserves all other types in the union
 *
 * @example
 *
 * ```ts
 * const values: unknown[] = ['Ada', 42, 'Lovelace'];
 *
 * const nonStrings = values.filter(isNotString);
 *
 * assert.deepStrictEqual(nonStrings, [42]);
 * ```
 *
 * @template T - The type of the input value
 * @param u - The value to check
 * @returns `true` if `u` is not a string, `false` otherwise. When `true`,
 *   TypeScript excludes `string` from the type.
 */
export const isNotString = <T,>(u: T): u is RelaxedExclude<T, string> =>
  typeof u !== 'string';

/**
 * Type guard that checks if a value is a symbol.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows `unknown` to `symbol` when `true`
 * - Identifies values created with `Symbol()` constructor
 *
 * @example
 *
 * ```ts
 * const id = Symbol('id');
 * const shared = Symbol.for('shared');
 * const tokens: unknown[] = [id, 'shared', shared];
 *
 * const symbols = tokens.filter(isSymbol);
 *
 * assert.deepStrictEqual(symbols, [id, shared]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a symbol, `false` otherwise. When `true`,
 *   TypeScript narrows the type to `symbol`.
 */
export const isSymbol = (u: unknown): u is symbol => typeof u === 'symbol';

/**
 * Type guard that checks if a value is not a symbol.
 *
 * **Type Narrowing Behavior:**
 *
 * - Excludes `symbol` from the input type when `true`
 * - Preserves all other types in the union
 *
 * @example
 *
 * ```ts
 * const id = Symbol('id');
 * const tokens: unknown[] = [id, 'shared'];
 *
 * const nonSymbols = tokens.filter(isNotSymbol);
 *
 * assert.deepStrictEqual(nonSymbols, ['shared']);
 * ```
 *
 * @template T - The type of the input value
 * @param u - The value to check
 * @returns `true` if `u` is not a symbol, `false` otherwise. When `true`,
 *   TypeScript excludes `symbol` from the type.
 */
export const isNotSymbol = <T,>(u: T): u is RelaxedExclude<T, symbol> =>
  typeof u !== 'symbol';

/**
 * Type guard that checks if a value is `null`.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input type to `null` when `true`
 * - Useful for explicit null checks
 *
 * @example
 *
 * ```ts
 * const values: readonly (number | null)[] = [null, 5] as const;
 *
 * const nullValues = values.filter(isNull);
 *
 * assert.deepStrictEqual(nullValues, [null]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is `null`, `false` otherwise. When `true`, TypeScript
 *   narrows the type to `null`.
 */
export const isNull = (u: unknown): u is null => u === null;

/**
 * Type guard that checks if a value is not `null`.
 *
 * **Type Narrowing Behavior:**
 *
 * - Excludes `null` from the input type when `true`
 * - Preserves all other types including `undefined`
 * - Commonly used to filter out null values
 *
 * @example
 *
 * ```ts
 * const values: (number | null)[] = [null, 5];
 *
 * const nonNullValues = values.filter(isNotNull);
 *
 * assert.deepStrictEqual(nonNullValues, [5]);
 * ```
 *
 * @template T - The type of the input value (which could be `null`)
 * @param u - The value to check
 * @returns `true` if `u` is not `null`, `false` otherwise. When `true`,
 *   TypeScript excludes `null` from the type.
 */
export const isNotNull = <T,>(u: T | null): u is T => u !== null;

/**
 * Type guard that checks if a value is `null` or `undefined` (nullish).
 *
 * This function uses the loose equality operator (`==`) to check for both
 * `null` and `undefined` in a single comparison, which is the standard
 * JavaScript idiom for nullish checks.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input type to `null | undefined` when `true`
 * - Useful for checking if a value is "nullish" (either null or undefined)
 *
 * @example
 *
 * ```ts
 * const values: (string | null | undefined)[] = ['Ada', null, undefined];
 *
 * const nullishValues = values.filter(isNullish);
 *
 * assert.deepStrictEqual(nullishValues, [null, undefined]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is `null` or `undefined`, `false` otherwise. When
 *   `true`, TypeScript narrows the type to `null | undefined`.
 */
export const isNullish = (u: unknown): u is null | undefined => u == null;

/**
 * Type guard that checks if a value is not `null` or `undefined` (non-nullish).
 *
 * This function uses the loose inequality operator (`!=`) to check that a value
 * is neither `null` nor `undefined` in a single comparison. This is equivalent
 * to TypeScript's `NonNullable<T>` utility type.
 *
 * **Type Narrowing Behavior:**
 *
 * - Excludes both `null` and `undefined` from the input type when `true`
 * - Equivalent to applying TypeScript's `NonNullable<T>` utility type
 * - Commonly used to filter out nullish values from arrays
 *
 * @example
 *
 * ```ts
 * const values: (string | null | undefined)[] = ['Ada', null, undefined];
 *
 * const definedValues = values.filter(isNonNullish);
 *
 * assert.deepStrictEqual(definedValues, ['Ada']);
 * ```
 *
 * @template T - The type of the input value
 * @param u - The value to check
 * @returns `true` if `u` is not `null` and not `undefined`, `false` otherwise.
 *   When `true`, TypeScript narrows the type to `NonNullable<T>`.
 */
export const isNonNullish = <T,>(u: T): u is NonNullable<T> => u != null;
