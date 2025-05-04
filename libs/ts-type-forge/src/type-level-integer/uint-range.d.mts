/**
 * Creates a union of non-negative integer literals starting from `Start` (inclusive) up to `End` (exclusive).
 * Requires `Start` and `End` to be non-negative integer literals where `Start <= End`.
 *
 * @template Start - The starting integer literal (inclusive).
 * @template End - The ending integer literal (exclusive).
 * @returns A union type `Start | Start + 1 | ... | End - 1`.
 * @example
 * type R1 = UintRange<3, 7>; // 3 | 4 | 5 | 6
 * type R2 = UintRange<0, 4>; // 0 | 1 | 2 | 3
 * type R3 = UintRange<5, 5>; // never
 */
type UintRange<Start extends number, End extends number> = RelaxedExclude<
  Index<End>,
  Index<Start>
>;

/**
 * Creates a union of non-negative integer literals starting from `MinValue` (inclusive) up to `MaxValue` (inclusive).
 * Requires `MinValue` and `MaxValue` to be non-negative integer literals where `MinValue <= MaxValue`.
 *
 * @template MinValue - The starting integer literal (inclusive).
 * @template MaxValue - The ending integer literal (inclusive).
 * @returns A union type `MinValue | MinValue + 1 | ... | MaxValue`.
 * @example
 * type RI1 = UintRangeInclusive<3, 7>; // 3 | 4 | 5 | 6 | 7
 * type RI2 = UintRangeInclusive<0, 4>; // 0 | 1 | 2 | 3 | 4
 * type RI3 = UintRangeInclusive<5, 5>; // 5
 */
type UintRangeInclusive<
  MinValue extends number,
  MaxValue extends number,
> = RelaxedExclude<IndexInclusive<MaxValue>, Index<MinValue>>;
