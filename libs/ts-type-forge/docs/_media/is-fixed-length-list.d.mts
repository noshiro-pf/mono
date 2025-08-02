/**
 * Checks if a given readonly array type `T` has a fixed length (i.e., is a tuple).
 * Returns `true` if `T` is a tuple, `false` if it's a regular array (`Type[]`).
 *
 * It works by checking if the general `number` type is assignable to the specific `length` property of `T`.
 * For tuples, `T['length']` is a specific number literal (e.g., `3`), and `number` is not assignable to `3`.
 * For regular arrays, `T['length']` is `number`, and `number` is assignable to `number`.
 *
 * @template T - The readonly array or tuple type to check.
 * @returns `true` if `T` is a tuple (fixed length), `false` otherwise.
 *
 * @example
 * type IsTuple = IsFixedLengthList<[1, 2, 3]>; // true
 * type IsArray = IsFixedLengthList<number[]>; // false
 * type IsReadonlyArray = IsFixedLengthList<readonly string[]>; // false
 * type IsEmptyTuple = IsFixedLengthList<[]>; // true
 * type IsTupleWithRest = IsFixedLengthList<[number, ...string[]]>; // false
 */
type IsFixedLengthList<T extends readonly unknown[]> =
  number extends T['length'] ? false : true;

/**
 * Checks if a given readonly array type `T` does *not* have a fixed length (i.e., is a regular array).
 * Returns `true` if `T` is a regular array (`Type[]`), `false` if it's a tuple.
 * This is the logical negation of `IsFixedLengthList`.
 *
 * @template T - The readonly array or tuple type to check.
 * @returns `true` if `T` is a regular array (not fixed length), `false` otherwise.
 *
 * @example
 * type IsNotTuple = IsNotFixedLengthList<[1, 2, 3]>; // false
 * type IsNotArray = IsNotFixedLengthList<number[]>; // true
 * type IsNotReadonlyArray = IsNotFixedLengthList<readonly string[]>; // true
 * type IsNotEmptyTuple = IsNotFixedLengthList<[]>; // false
 * type IsNotTupleWithRest = IsNotFixedLengthList<[number, ...string[]]>; // true
 */
type IsNotFixedLengthList<T extends readonly unknown[]> =
  number extends T['length'] ? true : false;
