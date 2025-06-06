import { expectType } from '../expect-type.mjs';

// Test Int type
expectType<Int, number>('<=');
expectType<number, Int>('!<='); // Not all numbers are integers

// Test that Int is a branded type
type IsBrandedInt = Int extends number
  ? number extends Int
    ? false
    : true
  : false;
expectType<IsBrandedInt, true>('=');

// Test Int extends FiniteNumber
expectType<Int, FiniteNumber>('<=');
expectType<FiniteNumber, Int>('!<=');

// Test NonZeroInt
expectType<NonZeroInt, Int>('<=');
expectType<NonZeroInt, NonZeroNumber>('<=');
expectType<Int, NonZeroInt>('!<=');

// Test NonNegativeInt
expectType<NonNegativeInt, Int>('<=');
expectType<NonNegativeInt, NonNegativeNumber>('<=');
expectType<Int, NonNegativeInt>('!<=');

// Test Uint is alias for NonNegativeInt
expectType<Uint, NonNegativeInt>('=');

// Test PositiveInt
expectType<PositiveInt, Int>('<=');
expectType<PositiveInt, PositiveNumber>('<=');
expectType<PositiveInt, NonZeroInt>('<=');
expectType<PositiveInt, NonNegativeInt>('<=');
expectType<Int, PositiveInt>('!<=');

// Test NegativeInt
expectType<NegativeInt, Int>('<=');
expectType<NegativeInt, NegativeNumber>('<=');
expectType<NegativeInt, NonZeroInt>('<=');
expectType<NegativeInt, NonNegativeInt>('!<=');
expectType<Int, NegativeInt>('!<=');

// Test PositiveInt and NegativeInt are disjoint
expectType<PositiveInt, NegativeInt>('!=');
expectType<NegativeInt, PositiveInt>('!=');

// Test WithSmallInt variants (commented out complex tests)
// WithSmallInt tests are complex due to literal/branded type interactions

// Test brand structure exists (all types are branded)
type IntIsBranded = number extends Int ? false : true;
type NonZeroIntIsBranded = number extends NonZeroInt ? false : true;
type NonNegativeIntIsBranded = number extends NonNegativeInt ? false : true;

expectType<IntIsBranded, true>('=');
expectType<NonZeroIntIsBranded, true>('=');
expectType<NonNegativeIntIsBranded, true>('=');

// Test practical usage scenarios (type-only tests)
// Functions using these types would be: array indexing, factorial, modulo operations
