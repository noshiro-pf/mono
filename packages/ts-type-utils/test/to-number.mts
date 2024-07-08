import { expectType } from './expect-type.mjs';

expectType<ToNumber<'1000'>, 1000>('=');
expectType<ToNumber<'8192'>, 8192>('=');
expectType<ToNumber<'9999'>, 9999>('=');
expectType<ToNumber<'10000'>, 10_000>('=');
