import { expectType } from '../expect-type.mjs';

// Test FiniteNumber
expectType<FiniteNumber, number>('<=');
expectType<number, FiniteNumber>('!<='); // number includes Infinity and -Infinity

// Test that FiniteNumber is branded
type IsBrandedFinite = FiniteNumber extends number
  ? number extends FiniteNumber
    ? false
    : true
  : false;
expectType<IsBrandedFinite, true>('=');

// Test InfiniteNumber
expectType<InfiniteNumber, number>('<=');
expectType<number, InfiniteNumber>('!<=');

// Test POSITIVE_INFINITY
expectType<POSITIVE_INFINITY, number>('<=');
expectType<number, POSITIVE_INFINITY>('!<=');

// Test NEGATIVE_INFINITY
expectType<NEGATIVE_INFINITY, number>('<=');
expectType<number, NEGATIVE_INFINITY>('!<=');

// Test InfiniteNumber includes both infinities
expectType<POSITIVE_INFINITY, InfiniteNumber>('<=');
expectType<NEGATIVE_INFINITY, InfiniteNumber>('<=');

// Test FiniteNumber and InfiniteNumber are disjoint
expectType<FiniteNumber, InfiniteNumber>('!=');
expectType<InfiniteNumber, FiniteNumber>('!=');

// Test POSITIVE_INFINITY and NEGATIVE_INFINITY are different
expectType<POSITIVE_INFINITY, NEGATIVE_INFINITY>('!=');
expectType<NEGATIVE_INFINITY, POSITIVE_INFINITY>('!=');

// Test NonNegativeFiniteNumber
expectType<NonNegativeFiniteNumber, FiniteNumber>('<=');
expectType<NonNegativeFiniteNumber, number>('<=');
expectType<FiniteNumber, NonNegativeFiniteNumber>('!<=');

// Test PositiveFiniteNumber
expectType<PositiveFiniteNumber, FiniteNumber>('<=');
expectType<PositiveFiniteNumber, NonNegativeFiniteNumber>('<=');
expectType<NonNegativeFiniteNumber, PositiveFiniteNumber>('!<=');

// Test NegativeFiniteNumber
expectType<NegativeFiniteNumber, FiniteNumber>('<=');
expectType<NegativeFiniteNumber, NonNegativeFiniteNumber>('!<=');

// Test NonZeroFiniteNumber
expectType<NonZeroFiniteNumber, FiniteNumber>('<=');
expectType<FiniteNumber, NonZeroFiniteNumber>('!<=');

// Test PositiveFiniteNumber and NegativeFiniteNumber are both NonZeroFiniteNumber
expectType<PositiveFiniteNumber, NonZeroFiniteNumber>('<=');
expectType<NegativeFiniteNumber, NonZeroFiniteNumber>('<=');

// Test PositiveFiniteNumber and NegativeFiniteNumber are disjoint
expectType<PositiveFiniteNumber, NegativeFiniteNumber>('!=');
expectType<NegativeFiniteNumber, PositiveFiniteNumber>('!=');

// Test brand structures (all types are branded)
type FiniteNumberIsBranded = number extends FiniteNumber ? false : true;
type InfiniteNumberIsBranded = number extends InfiniteNumber ? false : true;
type PositiveInfinityIsBranded = number extends POSITIVE_INFINITY
  ? false
  : true;
type NegativeInfinityIsBranded = number extends NEGATIVE_INFINITY
  ? false
  : true;

expectType<FiniteNumberIsBranded, true>('=');
expectType<InfiniteNumberIsBranded, true>('=');
expectType<PositiveInfinityIsBranded, true>('=');
expectType<NegativeInfinityIsBranded, true>('=');
