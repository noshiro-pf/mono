import { expectType } from 'ts-data-forge';
import { type IntRange, type IntRangeInclusive } from './int-range.mjs';
import { type UintRange, type UintRangeInclusive } from './uint-range.mjs';

expectType<IntRange<1, 5>, 1 | 2 | 3 | 4>('=');

expectType<IntRange<-3, 3>, -3 | -2 | -1 | 0 | 1 | 2>('=');

expectType<IntRange<3, -3>, never>('=');

expectType<IntRange<-5, -1>, -5 | -4 | -3 | -2>('=');

// single-element ranges
expectType<IntRange<0, 1>, 0>('=');

expectType<IntRange<-1, 0>, -1>('=');

// empty ranges
expectType<IntRange<0, 0>, never>('=');

expectType<IntRange<5, 5>, never>('=');

expectType<IntRange<-5, -5>, never>('=');

expectType<IntRange<5, 1>, never>('=');

expectType<IntRange<-1, -5>, never>('=');

expectType<IntRange<0, -1>, never>('=');

// matches UintRange when both bounds are non-negative
expectType<IntRange<3, 7>, UintRange<3, 7>>('=');

// boundary values (double as an instantiation-depth smoke test)
expectType<-128, IntRange<-128, 128>>('<=');

expectType<0, IntRange<-128, 128>>('<=');

expectType<127, IntRange<-128, 128>>('<=');

expectType<128, IntRange<-128, 128>>('!<=');

expectType<-129, IntRange<-128, 128>>('!<=');

// the `Int11` bound: `1024` is accepted only as an exclusive end
expectType<-1024, IntRange<-1024, 1024>>('<=');

expectType<1023, IntRange<-1024, 1024>>('<=');

expectType<1024, IntRange<-1024, 1024>>('!<=');

// @ts-expect-error `-1025` is below the `Int11` cap
expectType<1023, IntRange<-1025, 1024>>('<=');

expectType<IntRangeInclusive<1, 5>, 1 | 2 | 3 | 4 | 5>('=');

expectType<IntRangeInclusive<-3, 3>, -3 | -2 | -1 | 0 | 1 | 2 | 3>('=');

expectType<IntRangeInclusive<3, -3>, never>('=');

expectType<IntRangeInclusive<-5, -1>, -5 | -4 | -3 | -2 | -1>('=');

// the upper bound is included, unlike IntRange
expectType<IntRangeInclusive<-5, -3>, -5 | -4 | -3>('=');

expectType<IntRangeInclusive<-2, 0>, -2 | -1 | 0>('=');

// single-element ranges
expectType<IntRangeInclusive<0, 0>, 0>('=');

expectType<IntRangeInclusive<5, 5>, 5>('=');

expectType<IntRangeInclusive<-5, -5>, -5>('=');

// empty ranges (MinValue > MaxValue)
expectType<IntRangeInclusive<5, 1>, never>('=');

expectType<IntRangeInclusive<-1, -5>, never>('=');

expectType<IntRangeInclusive<0, -1>, never>('=');

// matches UintRangeInclusive when both bounds are non-negative
expectType<IntRangeInclusive<3, 7>, UintRangeInclusive<3, 7>>('=');

// relates to IntRange by one extra element at the top
expectType<IntRangeInclusive<-3, 2>, IntRange<-3, 3>>('=');

// boundary values (double as an instantiation-depth smoke test)
expectType<-128, IntRangeInclusive<-128, 127>>('<=');

expectType<0, IntRangeInclusive<-128, 127>>('<=');

expectType<127, IntRangeInclusive<-128, 127>>('<=');

expectType<-129, IntRangeInclusive<-128, 127>>('!<=');

// the `Int11` bound: an inclusive upper bound never needs `1024`
expectType<-1024, IntRangeInclusive<-1024, 1023>>('<=');

expectType<1023, IntRangeInclusive<-1024, 1023>>('<=');

// @ts-expect-error `1024` is above the `Int11` cap
expectType<1023, IntRangeInclusive<-1024, 1024>>('<=');
