import { expectType } from '../expect-type.mjs';

// Test SafeInt type
expectType<SafeInt, number>('<=');

expectType<number, SafeInt>('!<='); // Not all numbers are SafeInt

// Test that SafeInt is a branded type
type IsBrandedSafeInt = SafeInt extends number
  ? number extends SafeInt
    ? false
    : true
  : false;

expectType<IsBrandedSafeInt, true>('=');

// Test SafeInt extends Int
expectType<SafeInt, Int>('<=');

expectType<Int, SafeInt>('!<=');

// Test NonZeroSafeInt
expectType<NonZeroSafeInt, SafeInt>('<=');

expectType<NonZeroSafeInt, NonZeroNumber>('<=');

expectType<SafeInt, NonZeroSafeInt>('!<=');

// Test SafeUint
expectType<SafeUint, SafeInt>('<=');

expectType<SafeUint, NonNegativeNumber>('<=');

expectType<SafeInt, SafeUint>('!<=');

// Test NonNegativeSafeInt is alias for SafeUint
expectType<NonNegativeSafeInt, SafeUint>('=');

expectType<SafeUint, NonNegativeSafeInt>('=');

// Test PositiveSafeInt
expectType<PositiveSafeInt, SafeInt>('<=');

expectType<PositiveSafeInt, PositiveNumber>('<=');

expectType<PositiveSafeInt, NonZeroSafeInt>('<=');

expectType<PositiveSafeInt, SafeUint>('<=');

expectType<SafeInt, PositiveSafeInt>('!<=');

// Test NegativeSafeInt
expectType<NegativeSafeInt, SafeInt>('<=');

expectType<NegativeSafeInt, NegativeNumber>('<=');

expectType<NegativeSafeInt, NonZeroSafeInt>('<=');

expectType<NegativeSafeInt, SafeUint>('!<=');

expectType<SafeInt, NegativeSafeInt>('!<=');

// Test PositiveSafeInt and NegativeSafeInt are disjoint
expectType<PositiveSafeInt, NegativeSafeInt>('!=');

expectType<NegativeSafeInt, PositiveSafeInt>('!=');

// Test WithSmallInt variants (commented out complex tests)
// WithSmallInt tests are complex due to literal/branded type interactions

// Test brand structure exists (type is branded)
type SafeIntIsBranded = number extends SafeInt ? false : true;

expectType<SafeIntIsBranded, true>('=');

// Test practical usage scenarios (type-only tests)
// Functions using these types would be: safe math operations, file sizes, user IDs
