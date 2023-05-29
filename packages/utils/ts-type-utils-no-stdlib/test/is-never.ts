import { type IsNever } from '../src';
import { expectType } from './expect-type';

expectType<IsNever<never>, true>('=');
expectType<IsNever<string>, false>('=');
expectType<IsNever<number | string>, false>('=');
expectType<IsNever<[number | string]>, false>('=');
