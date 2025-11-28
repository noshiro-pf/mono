import { expectType } from '../expect-type.mjs';
import { hasKey, type HasKeyReturnType } from './has-key.mjs';

{
  expectType<
    HasKeyReturnType<Readonly<{ a: 0 }> | Readonly<{ b: 1 }>, 'a'>,
    Readonly<{ a: 0 }>
  >('=');

  expectType<
    HasKeyReturnType<Readonly<{ a: 0 }> | Readonly<{ b: 1 }>, 'b'>,
    Readonly<{ b: 1 }>
  >('=');

  expectType<
    HasKeyReturnType<Readonly<{ a: 0 }> | Readonly<{ b: 1 }>, 'd'>,
    never
  >('=');

  expectType<
    HasKeyReturnType<
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | Readonly<{ b: 2 }>
      | Readonly<{ c: 3 }>,
      'a'
    >,
    Readonly<{ a: 0 }> | Readonly<{ a: 1; b: 1 }>
  >('=');

  expectType<
    HasKeyReturnType<
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | Readonly<{ b: 2 }>
      | Readonly<{ c: 3 }>,
      'b'
    >,
    Readonly<{ a: 1; b: 1 }> | Readonly<{ b: 2 }>
  >('=');

  expectType<
    HasKeyReturnType<
      | ReadonlyRecord<string, number>
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | Readonly<{ b: 2 }>,
      'a'
    >,
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | (ReadonlyRecord<'a', number> & ReadonlyRecord<string, number>)
  >('=');

  expectType<
    HasKeyReturnType<ReadonlyRecord<string, unknown>, 'a'>,
    ReadonlyRecord<'a', unknown> & ReadonlyRecord<string, unknown>
  >('=');
}

{
  type R = Readonly<{ a: 0 }> | Readonly<{ b: 1 }>;

  const obj: R = { a: 0 } as R;

  if (hasKey(obj, 'a')) {
    expectType<typeof obj.a, 0>('=');

    expectType<typeof obj, Readonly<{ a: 0 }>>('=');
  }

  if (hasKey(obj, 'c')) {
    expectType<typeof obj, never>('=');
  }
}

{
  type R =
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | Readonly<{ b: 2 }>
    | Readonly<{ c: 3 }>;

  const obj: R = { a: 0 } as R;

  if (hasKey(obj, 'a') && hasKey(obj, 'b')) {
    expectType<typeof obj.a, 1>('=');

    expectType<typeof obj.b, 1>('=');

    expectType<typeof obj, Readonly<{ a: 1; b: 1 }>>('=');
  }
}

{
  type R =
    | ReadonlyRecord<string, number>
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | Readonly<{ b: 2 }>;

  const obj: R = { a: 0 } as R;

  expectType<
    R,
    | ReadonlyRecord<string, number>
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | Readonly<{ b: 2 }>
  >('=');

  if (hasKey(obj, 'a')) {
    expectType<typeof obj.a, number>('=');

    expectType<
      typeof obj,
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | (ReadonlyRecord<'a', number> & ReadonlyRecord<string, number>)
    >('=');
  }

  if (hasKey(obj, 'a') && hasKey(obj, 'b')) {
    expectType<typeof obj.a, number>('=');

    expectType<typeof obj.b, number>('=');

    expectType<
      typeof obj,
      | Readonly<{ a: 1; b: 1 }>
      | (ReadonlyRecord<'a', number> &
          ReadonlyRecord<'b', number> &
          ReadonlyRecord<string, number>)
    >('=');
  }
}

{
  const o: ReadonlyRecord<string, unknown> = { a: 0, b: 1 };

  if (hasKey(o, 'a')) {
    expectType<typeof o.a, unknown>('=');

    expectType<
      typeof o,
      ReadonlyRecord<'a', unknown> & ReadonlyRecord<string, unknown>
    >('=');
  }

  if (hasKey(o, 'c')) {
    expectType<typeof o.c, unknown>('=');

    expectType<
      typeof o,
      ReadonlyRecord<'c', unknown> & ReadonlyRecord<string, unknown>
    >('=');
  }

  if (hasKey(o, 'a') && hasKey(o, 'b')) {
    expectType<typeof o.a, unknown>('=');

    expectType<typeof o.b, unknown>('=');

    expectType<
      typeof o,
      ReadonlyRecord<'a', unknown> &
        ReadonlyRecord<'b', unknown> &
        ReadonlyRecord<string, unknown>
    >('=');
  }

  {
    /**
     * @note Simply using `R & Record<K, R[K]>` as the return type of hasKey may seem good enough
     * since it works as intended for cases like `obj: Record<string, unknown>`.
     * However, for finite-sized types like `obj: { a: 0 } | { b: 1 }`,
     * filtering with `hasKey(obj, 'a')` causes `obj.a` to widen to `unknown` instead of `0`,
     * which doesn't work well.
     */

    const hasOwnNaive = <R extends UnknownRecord, K extends string>(
      obj: R,
      key: K,
    ): obj is R & Record<K, R[K]> => hasKey(obj, key);

    {
      type O =
        | Readonly<{ a: 0 }>
        | Readonly<{ a: 1; b: 1 }>
        | Readonly<{ b: 2 }>
        | Record<string, number>;

      const o2 = { b: 2 } as O;

      if (hasOwnNaive(o2, 'a')) {
        expectType<typeof o2.a, unknown>('=');
      }

      // eslint-disable-next-line no-restricted-syntax
      if ('a' in o2) {
        expectType<typeof o2.a, number>('=');
      }
    }

    {
      type O =
        | Readonly<{ a: 0 }>
        | Readonly<{ a: 1; b: 1 }>
        | Readonly<{ b: 2 }>;

      const o2 = { b: 2 } as O;

      if (hasOwnNaive(o2, 'a')) {
        expectType<typeof o2.a, unknown>('=');
      }

      // eslint-disable-next-line no-restricted-syntax
      if ('a' in o2) {
        expectType<typeof o2.a, 0 | 1>('=');
      }
    }
  }
}
