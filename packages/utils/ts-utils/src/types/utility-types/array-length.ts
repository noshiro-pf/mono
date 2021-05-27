import type { TypeEq } from './test-type';
import { assertType } from './test-type';

export type Length<T extends { length: number }> = T['length'];

assertType<TypeEq<Length<readonly [1, 2, 3]>, 3>>();
