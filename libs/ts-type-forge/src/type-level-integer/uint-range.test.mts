import { expectType } from 'ts-data-forge';
import { type UintRange, type UintRangeInclusive } from './uint-range.mjs';

expectType<UintRange<0, 3>, 0 | 1 | 2>('=');

expectType<UintRange<0, 0>, never>('=');

expectType<UintRange<0, 1>, 0>('=');

// @ts-expect-error non-integer bounds are not `Uint11`s
expectType<UintRange<1.2, 3.4>, never>('=');

expectType<UintRange<0, 5>, 0 | 1 | 2 | 3 | 4>('=');

expectType<UintRange<2, 5>, 2 | 3 | 4>('=');

// large union type (boundary checks double as an instantiation-depth smoke test)
expectType<0, UintRange<0, 100>>('<=');

expectType<99, UintRange<0, 100>>('<=');

expectType<100, UintRange<0, 100>>('!<=');

expectType<UintRangeInclusive<0, 3>, 0 | 1 | 2 | 3>('=');

expectType<UintRangeInclusive<0, 0>, 0>('=');

expectType<UintRangeInclusive<0, 1>, 0 | 1>('=');

// @ts-expect-error non-integer bounds are not `Uint11`s
expectType<UintRangeInclusive<1.2, 3.4>, never>('=');

// @ts-expect-error a negative bound is not a `Uint11`
expectType<UintRangeInclusive<0, -1>, never>('=');

// @ts-expect-error non-literal `number` is not a `Uint11`
expectType<UintRangeInclusive<number, number>, never>('=');

expectType<UintRangeInclusive<0, 5>, 0 | 1 | 2 | 3 | 4 | 5>('=');

expectType<UintRangeInclusive<2, 5>, 2 | 3 | 4 | 5>('=');

// large union type (boundary checks double as an instantiation-depth smoke test)
expectType<0, UintRangeInclusive<0, 100>>('<=');

expectType<100, UintRangeInclusive<0, 100>>('<=');

expectType<101, UintRangeInclusive<0, 100>>('!<=');

// the `Uint11` bound: `2048` is accepted only as an exclusive end
expectType<2047, UintRange<0, 2048>>('<=');

expectType<2047, UintRangeInclusive<0, 2047>>('<=');

// @ts-expect-error `2048` is above the `Uint11` cap
expectType<2047, UintRangeInclusive<0, 2048>>('<=');
