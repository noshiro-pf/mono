import { type Seq } from '../src';
import { expectType } from './expect-type';

expectType<Seq<3>, readonly [0, 1, 2]>('=');
expectType<Seq<0>, readonly []>('=');
expectType<Seq<1.2>, never>('=');
expectType<Seq<5>, readonly [0, 1, 2, 3, 4]>('=');
