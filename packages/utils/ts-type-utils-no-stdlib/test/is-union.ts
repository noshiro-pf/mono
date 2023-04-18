import { type IsUnion } from '../src';
import { expectType } from './expect-type';

expectType<IsUnion<string>, false>('=');
expectType<IsUnion<number | string>, true>('=');
expectType<IsUnion<[number | string]>, false>('=');
