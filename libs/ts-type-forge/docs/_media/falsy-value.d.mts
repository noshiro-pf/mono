/**
 * Represents the set of JavaScript values that are considered "falsy" in boolean contexts.
 *
 * In JavaScript, these values are coerced to `false` when used in boolean contexts
 * such as `if` statements, logical operators (`&&`, `||`), or the `Boolean()` constructor.
 *
 * The falsy values include:
 * - `false` - the boolean false literal
 * - `0` - the number zero
 * - `-0` - negative zero (distinct from `0` in some contexts)
 * - `0n` - the bigint zero
 * - `''` - empty string
 * - `null` - the null value
 * - `undefined` - the undefined value
 *
 * Note: `NaN` is also falsy at runtime but cannot be represented as a literal type
 * since `NaN !== NaN` and TypeScript cannot create a literal type for it.
 *
 * @example
 * ```ts
 * const checkFalsy = (value: unknown): value is FalsyValue => {
 *   return !value;
 * };
 *
 * checkFalsy(false);    // true
 * checkFalsy(0);        // true
 * checkFalsy('');       // true
 * checkFalsy(null);     // true
 * checkFalsy(undefined); // true
 * checkFalsy('hello');  // false
 * checkFalsy(1);        // false
 *
 * // Type guard for filtering out falsy values
 * const truthyValues = [0, 1, '', 'hello', false, true, null].filter(
 *   (value): value is Exclude<typeof value, FalsyValue> => Boolean(value)
 * ); // [1, 'hello', true]
 *
 * // Conditional logic based on falsy values
 * type IsFalsy<T> = T extends FalsyValue ? true : false;
 * type Test1 = IsFalsy<0>;     // true
 * type Test2 = IsFalsy<'hi'>;  // false
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
type FalsyValue = -0 | '' | 0 | 0n | false | null | undefined;
