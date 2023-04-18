import { type ToNumber } from '../src';
import { expectType } from './expect-type';

expectType<ToNumber<'1000'>, 1000>('=');
expectType<ToNumber<'8192'>, 8192>('=');
expectType<ToNumber<'9999'>, 9999>('=');
expectType<ToNumber<'10000'>, 10_000>('=');
