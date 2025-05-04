import { expectType } from '../../expect-type.mjs';

expectType<
  TSTypeForgeInternals.RecordPathPrefixes<readonly [1, 2, 3]>,
  readonly [] | readonly [1, 2, 3] | readonly [1, 2] | readonly [1]
>('=');

expectType<TSTypeForgeInternals.RecordPathPrefixes<[]>, readonly []>('=');
