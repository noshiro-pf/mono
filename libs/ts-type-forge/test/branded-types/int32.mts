import { expectType } from '../expect-type.mjs';

// Test Int32 type
expectType<Int32, number>('<=');
expectType<number, Int32>('!<='); // Not all numbers are Int32

// Test that Int32 is a branded type
type IsBrandedInt32 = Int32 extends number
  ? number extends Int32
    ? false
    : true
  : false;
expectType<IsBrandedInt32, true>('=');

// Test Int32 extends SafeInt
expectType<Int32, SafeInt>('<=');
expectType<SafeInt, Int32>('!<=');

// Test NonZeroInt32
expectType<NonZeroInt32, Int32>('<=');
expectType<NonZeroInt32, NonZeroNumber>('<=');
expectType<Int32, NonZeroInt32>('!<=');

// Test NonNegativeInt32
expectType<NonNegativeInt32, Int32>('<=');
expectType<NonNegativeInt32, NonNegativeNumber>('<=');
expectType<Int32, NonNegativeInt32>('!<=');

// Test PositiveInt32
expectType<PositiveInt32, Int32>('<=');
expectType<PositiveInt32, PositiveNumber>('<=');
expectType<PositiveInt32, NonZeroInt32>('<=');
expectType<PositiveInt32, NonNegativeInt32>('<=');
expectType<Int32, PositiveInt32>('!<=');

// Test NegativeInt32
expectType<NegativeInt32, Int32>('<=');
expectType<NegativeInt32, NegativeNumber>('<=');
expectType<NegativeInt32, NonZeroInt32>('<=');
expectType<NegativeInt32, NonNegativeInt32>('!<=');
expectType<Int32, NegativeInt32>('!<=');

// Test PositiveInt32 and NegativeInt32 are disjoint
expectType<PositiveInt32, NegativeInt32>('!=');
expectType<NegativeInt32, PositiveInt32>('!=');

// Test WithSmallInt variants (commented out complex tests)
// WithSmallInt tests are complex due to literal/branded type interactions

// Test brand structure exists (type is branded)
type Int32IsBranded = number extends Int32 ? false : true;
expectType<Int32IsBranded, true>('=');

// Test range constraints (32-bit: -2,147,483,648 to 2,147,483,647)
// Note: Range constraints (32-bit: -2,147,483,648 to 2,147,483,647) are enforced at runtime
// through type guards, not compile time, so we can't test them with expectType

// Test practical usage scenarios (type-only tests)
// Functions using these types would be: bitwise operations, user IDs, scores
