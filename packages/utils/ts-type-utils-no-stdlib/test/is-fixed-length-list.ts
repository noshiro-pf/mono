import { type IsFixedLengthList } from '../src';
import { expectType } from './expect-type';

expectType<IsFixedLengthList<[]>, true>('=');
expectType<IsFixedLengthList<[1 | 2, 3]>, true>('=');
expectType<IsFixedLengthList<[1, 2, 3]>, true>('=');
expectType<IsFixedLengthList<readonly []>, true>('=');
expectType<IsFixedLengthList<readonly [1 | 2, 3]>, true>('=');
expectType<IsFixedLengthList<readonly [1, 2, 3]>, true>('=');

expectType<IsFixedLengthList<number[]>, false>('=');
expectType<IsFixedLengthList<readonly number[]>, false>('=');
expectType<IsFixedLengthList<[number, 1, 2, ...number[]]>, false>('=');
expectType<IsFixedLengthList<readonly [number, 1, 2, ...number[]]>, false>('=');
expectType<IsFixedLengthList<[number, 1, 2, ...(readonly number[])]>, false>(
  '='
);
expectType<
  IsFixedLengthList<readonly [number, 1, 2, ...(readonly number[])]>,
  false
>('=');
