import {
  type Int,
  type NonNegativeNumber,
  type PositiveInt,
  type PositiveNumber,
  type PositiveSafeInt,
  type SafeInt,
  type Uint,
  type Uint32,
} from '../src';
import { expectType } from './expect-type';

expectType<PositiveNumber, NonNegativeNumber>('<=');
expectType<Uint, NonNegativeNumber>('<=');
expectType<Uint, Int>('<=');
expectType<Uint, NonNegativeNumber>('<=');
expectType<PositiveInt, Int>('<=');
expectType<PositiveInt, PositiveNumber>('<=');
expectType<Uint32, Uint>('<=');
expectType<Uint32, NonNegativeNumber>('<=');
expectType<SafeInt, Int>('<=');
expectType<PositiveSafeInt, SafeInt>('<=');
