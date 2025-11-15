import { expectType } from '../expect-type.mjs';

// Test Int16 type
expectType<Int16, number>('<=');

expectType<number, Int16>('!<='); // Not all numbers are Int16

// Test that Int16 is a branded type
type IsBrandedInt16 = Int16 extends number
  ? number extends Int16
    ? false
    : true
  : false;

expectType<IsBrandedInt16, true>('=');

// Test Int16 extends Int32
expectType<Int16, Int32>('<=');

expectType<Int32, Int16>('!<=');

// Test NonZeroInt16
expectType<NonZeroInt16, Int16>('<=');

expectType<NonZeroInt16, NonZeroNumber>('<=');

expectType<Int16, NonZeroInt16>('!<=');

// Test NonNegativeInt16
expectType<NonNegativeInt16, Int16>('<=');

expectType<NonNegativeInt16, NonNegativeNumber>('<=');

expectType<Int16, NonNegativeInt16>('!<=');

// Test PositiveInt16
expectType<PositiveInt16, Int16>('<=');

expectType<PositiveInt16, PositiveNumber>('<=');

expectType<PositiveInt16, NonZeroInt16>('<=');

expectType<PositiveInt16, NonNegativeInt16>('<=');

expectType<Int16, PositiveInt16>('!<=');

// Test NegativeInt16
expectType<NegativeInt16, Int16>('<=');

expectType<NegativeInt16, NegativeNumber>('<=');

expectType<NegativeInt16, NonZeroInt16>('<=');

expectType<NegativeInt16, NonNegativeInt16>('!<=');

expectType<Int16, NegativeInt16>('!<=');

// Test PositiveInt16 and NegativeInt16 are disjoint
expectType<PositiveInt16, NegativeInt16>('!=');

expectType<NegativeInt16, PositiveInt16>('!=');

// Test WithSmallInt variants (commented out complex tests)
// WithSmallInt tests are complex due to literal/branded type interactions

// Test brand structure exists (type is branded)
type Int16IsBranded = number extends Int16 ? false : true;

expectType<Int16IsBranded, true>('=');

// Test range constraints (16-bit: -32768 to 32767)
// Note: Range constraints (16-bit: -32768 to 32767) are enforced at runtime
// through type guards, not compile time, so we can't test them with expectType

// Test practical usage scenarios (type-only tests)
// Functions using these types would be: audio samples, temperature readings, offsets
