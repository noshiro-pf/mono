export const TS_TYPE_FORGE_MODULE = 'ts-type-forge';

export const NON_EMPTY_TUPLE_TYPE_NAME = 'NonEmptyTuple';

export const MUTABLE_NON_EMPTY_TUPLE_TYPE_NAME = 'MutableNonEmptyTuple';

export const MIN_LENGTH_TUPLE_TYPE_NAME = 'MinLengthTuple';

export const MUTABLE_MIN_LENGTH_TUPLE_TYPE_NAME = 'MutableMinLengthTuple';

export const FIXED_LENGTH_TUPLE_TYPE_NAME = 'FixedLengthTuple';

export const MUTABLE_FIXED_LENGTH_TUPLE_TYPE_NAME = 'MutableFixedLengthTuple';

/**
 * Upper bound for the `maxLength` option of `prefer-length-constrained-tuple`.
 * Beyond this, spelling the tuple out is usually intentional (e.g. a matrix
 * row), and the named form stops being more readable.
 */
export const DEFAULT_MAX_TUPLE_LENGTH = 10;
