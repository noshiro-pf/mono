import { type MakeTuple } from '../src';
import { expectType } from './expect-type';

expectType<MakeTuple<unknown, 3>, readonly [unknown, unknown, unknown]>('=');
