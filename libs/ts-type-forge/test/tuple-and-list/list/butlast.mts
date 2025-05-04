import { expectType } from '../../expect-type.mjs';

expectType<List.ButLast<readonly []>, readonly []>('=');
expectType<List.ButLast<readonly [1]>, readonly []>('=');
expectType<List.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>('=');
expectType<
  List.ButLast<readonly [1, 2, 3, ...(readonly number[])]>,
  readonly [1, 2, 3, ...(readonly number[])]
>('=');
