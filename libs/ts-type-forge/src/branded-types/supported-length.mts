import { type UintRangeInclusive } from '../type-level-integer/index.mjs';

/**
 * The inclusive upper bound (`2048`) of the length parameters accepted by the
 * branded length-constrained types (`MaxLengthString` / `MinLengthString` /
 * `BoundedLengthString` / `FixedLengthString` and `MaxLengthArray` /
 * `MinLengthArray` / `BoundedLengthArray` / `FixedLengthArray`).
 *
 * The brand encodings rely on `MakeTuple`, which breaks down near the
 * compiler's 10,000-element tuple limit; this cap is kept well below that
 * limit so that an excessive length fails with a clear constraint error
 * instead of a cryptic deep-instantiation error, and so that the worst-case
 * cost of a single brand stays bounded.
 *
 * Exported so that downstream libraries (e.g. runtime guards and validators)
 * can share the same boundary instead of hard-coding their own.
 */
export type SupportedLengthCap = 2048;

/**
 * Union of the length values (`0 | 1 | ... | 2048`) accepted by the length
 * parameters of the branded length-constrained string and array types.
 *
 * The constraint costs almost nothing for the type checker: the union is
 * constructed once per program and cached, and each instantiation only adds a
 * single union-membership check. Its purpose is to reject length literals for
 * which the brand encoding would break down (see {@link SupportedLengthCap})
 * with a readable constraint error, and to reject non-literal `number`, for
 * which the brand would be meaningless.
 */
export type SupportedLength = UintRangeInclusive<0, SupportedLengthCap>;
