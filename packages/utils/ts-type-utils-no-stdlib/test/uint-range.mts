import { expectType } from './expect-type.mjs';

expectType<UintRange<0, 3>, 0 | 1 | 2>('=');
expectType<UintRange<0, 0>, never>('=');
expectType<UintRange<0, 1>, 0>('=');
expectType<UintRange<1.2, 3.4>, never>('=');
expectType<UintRange<0, 5>, 0 | 1 | 2 | 3 | 4>('=');
expectType<UintRange<2, 5>, 2 | 3 | 4>('=');

// large union type
expectType<UintRange<0, 100>, UintRange<0, 100>>('=');

expectType<UintRangeInclusive<0, 3>, 0 | 1 | 2 | 3>('=');
expectType<UintRangeInclusive<0, 0>, 0>('=');
expectType<UintRangeInclusive<0, 1>, 0 | 1>('=');
expectType<UintRangeInclusive<1.2, 3.4>, never>('=');
expectType<UintRangeInclusive<0, -1>, never>('=');
expectType<UintRangeInclusive<number, number>, never>('=');
expectType<UintRangeInclusive<0, 5>, 0 | 1 | 2 | 3 | 4 | 5>('=');
expectType<UintRangeInclusive<2, 5>, 2 | 3 | 4 | 5>('=');

// large union type
expectType<UintRangeInclusive<0, 100>, UintRangeInclusive<0, 100>>('=');
