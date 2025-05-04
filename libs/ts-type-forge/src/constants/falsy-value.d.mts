/**
 * Represents the set of JavaScript values considered "falsy".
 * Includes `false`, `0`, `''` (empty string), `null`, and `undefined`.
 * Note: `NaN` is also falsy at runtime but cannot be represented as a literal type here.
 */
type FalsyValue = -0 | '' | 0 | 0n | false | null | undefined;
