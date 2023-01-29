import { type ArrayOfLength, type MutableArrayOfLength } from '../src';
import { expectType } from './expect-type';

expectType<[0, 0], MutableArrayOfLength<2, 0>>('=');
expectType<[0, 0, 0], MutableArrayOfLength<3, 0>>('=');
expectType<[0, 0, 0, 0], MutableArrayOfLength<4, 0>>('=');
expectType<[0, 0, 0, 0, 0], MutableArrayOfLength<5, 0>>('=');
expectType<readonly [0, 0], ArrayOfLength<2, 0>>('=');
expectType<readonly [0, 0, 0], ArrayOfLength<3, 0>>('=');
expectType<readonly [0, 0, 0, 0], ArrayOfLength<4, 0>>('=');
expectType<readonly [0, 0, 0, 0, 0], ArrayOfLength<5, 0>>('=');
