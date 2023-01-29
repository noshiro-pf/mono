import { type Prefixes, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<
  TypeEq<
    Prefixes<readonly [1, 2, 3]>,
    readonly [] | readonly [1, 2, 3] | readonly [1, 2] | readonly [1]
  >
>();

assertType<TypeEq<Prefixes<[]>, readonly []>>();
