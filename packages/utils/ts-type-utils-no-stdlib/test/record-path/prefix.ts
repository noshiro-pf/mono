import { type Prefixes } from '../../src';
import { expectType } from '../expect-type';

expectType<
  Prefixes<readonly [1, 2, 3]>,
  readonly [] | readonly [1, 2, 3] | readonly [1, 2] | readonly [1]
>('=');

expectType<Prefixes<[]>, readonly []>('=');
