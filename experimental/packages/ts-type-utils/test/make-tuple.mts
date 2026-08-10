import { expectType } from './expect-type.mjs';

expectType<MakeTuple<unknown, 3>, readonly [unknown, unknown, unknown]>('=');
expectType<MakeTuple<null, 0>, readonly []>('=');
expectType<MakeTuple<3, 5>, readonly [3, 3, 3, 3, 3]>('=');
expectType<MakeTuple<0, 1000>, MakeTuple<0, 1000>>('=');
