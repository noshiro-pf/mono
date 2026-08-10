export const TS_FORTRESS_MODULE = 'ts-fortress';

export const ARRAY_FN = 'array';

export const BOUNDED_LENGTH_TUPLE_FN = 'boundedLengthTuple';

export const FIXED_LENGTH_TUPLE_FN = 'fixedLengthTuple';

export const MAX_LENGTH_TUPLE_FN = 'maxLengthTuple';

export const MIN_LENGTH_ARRAY_FN = 'minLengthArray';

export const MIN_LENGTH_TUPLE_FN = 'minLengthTuple';

export const NON_EMPTY_ARRAY_FN = 'nonEmptyArray';

/**
 * Inclusive upper bound of ts-type-forge's `StructuralPrefixLength` (`0..10`) —
 * the lengths the structural `*Tuple` combinators encode in their result type.
 * A bound outside this range selects a different overload (one that drops the
 * constraint), so a rewrite that carries a bound over to another combinator
 * only stays type-identical while the bound is within it.
 */
export const STRUCTURAL_PREFIX_CAP = 10;
