import { expectType } from './expect-type.mjs';

{
  // StrictLibInternals.HasOwnReturnType

  expectType<
    StrictLibInternals.HasOwnReturnType<
      Readonly<{ a: 0 }> | Readonly<{ b: 1 }>,
      'a'
    >,
    Readonly<{ a: 0 }>
  >('=');

  expectType<
    StrictLibInternals.HasOwnReturnType<
      Readonly<{ a: 0 }> | Readonly<{ b: 1 }>,
      'b'
    >,
    Readonly<{ b: 1 }>
  >('=');

  expectType<
    StrictLibInternals.HasOwnReturnType<
      Readonly<{ a: 0 }> | Readonly<{ b: 1 }>,
      'd'
    >,
    never
  >('=');

  expectType<
    StrictLibInternals.HasOwnReturnType<
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | Readonly<{ b: 2 }>
      | Readonly<{ c: 3 }>,
      'a'
    >,
    Readonly<{ a: 0 }> | Readonly<{ a: 1; b: 1 }>
  >('=');

  expectType<
    StrictLibInternals.HasOwnReturnType<
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | Readonly<{ b: 2 }>
      | Readonly<{ c: 3 }>,
      'b'
    >,
    Readonly<{ a: 1; b: 1 }> | Readonly<{ b: 2 }>
  >('=');

  expectType<
    StrictLibInternals.HasOwnReturnType<
      | MutableRecord<string, number>
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | Readonly<{ b: 2 }>,
      'a'
    >,
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | (MutableRecord<'a', number> & MutableRecord<string, number>)
  >('=');

  expectType<
    StrictLibInternals.HasOwnReturnType<MutableRecord<string, unknown>, 'a'>,
    MutableRecord<'a', unknown> & MutableRecord<string, unknown>
  >('=');
}

{
  type R = Readonly<{ a: 0 }> | Readonly<{ b: 1 }>;

  // eslint-disable-next-line no-restricted-syntax
  const obj: R = { a: 0 } as R;

  if (Object.hasOwn(obj, 'a')) {
    expectType<typeof obj.a, 0>('=');
    expectType<typeof obj, Readonly<{ a: 0 }>>('=');
  }

  if (Object.hasOwn(obj, 'c')) {
    expectType<typeof obj, never>('=');
  }
}

{
  type R =
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | Readonly<{ b: 2 }>
    | Readonly<{ c: 3 }>;

  // eslint-disable-next-line no-restricted-syntax
  const obj: R = { a: 0 } as R;

  if (Object.hasOwn(obj, 'a') && Object.hasOwn(obj, 'b')) {
    expectType<typeof obj.a, 1>('=');
    expectType<typeof obj.b, 1>('=');
    expectType<typeof obj, Readonly<{ a: 1; b: 1 }>>('=');
  }
}

{
  type R =
    | MutableRecord<string, number>
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | Readonly<{ b: 2 }>;

  // eslint-disable-next-line no-restricted-syntax
  const obj: R = { a: 0 } as R;

  expectType<R, MutableRecord<string, number>>('!=');

  if (Object.hasOwn(obj, 'a')) {
    expectType<typeof obj.a, number>('=');

    expectType<
      typeof obj,
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | (MutableRecord<'a', number> & MutableRecord<string, number>)
    >('=');
  }

  if (Object.hasOwn(obj, 'a') && Object.hasOwn(obj, 'b')) {
    expectType<typeof obj.a, number>('=');
    expectType<typeof obj.b, number>('=');
    expectType<
      typeof obj,
      | Readonly<{ a: 1; b: 1 }>
      | (MutableRecord<'a', number> &
          MutableRecord<'b', number> &
          MutableRecord<string, number>)
    >('=');
  }
}

{
  const obj: MutableRecord<string, unknown> = { a: 0, b: 1 };

  if (Object.hasOwn(obj, 'a')) {
    expectType<typeof obj.a, unknown>('=');
    expectType<
      typeof obj,
      MutableRecord<'a', unknown> & MutableRecord<string, unknown>
    >('=');
  }

  if (Object.hasOwn(obj, 'c')) {
    expectType<typeof obj.c, unknown>('=');
    expectType<
      typeof obj,
      MutableRecord<'c', unknown> & MutableRecord<string, unknown>
    >('=');
  }

  if (Object.hasOwn(obj, 'a') && Object.hasOwn(obj, 'b')) {
    expectType<typeof obj.a, unknown>('=');
    expectType<typeof obj.b, unknown>('=');
    expectType<
      typeof obj,
      MutableRecord<'a', unknown> &
        MutableRecord<'b', unknown> &
        MutableRecord<string, unknown>
    >('=');
  }

  {
    /**
     * @note Object.hasOwn の返り値型は `R & Record<K, R[K]>` とするだけでも
     * `obj: Record<string, unknown>` などに対しては意図通りに動作するため一見良さそうに思えるが、
     * `obj: { a: 0 } | { b: 1 }` のような有限サイズの型に対して
     * `Object.hasOwn(obj, 'a')` で絞った結果の `obj.a` が `1` ではなく `unknown` に広がってしまい、あまり上手くいかない。
     */

    const hasOwnNaive = <R extends RecordBase, K extends string>(
      obj: R,
      key: K,
    ): obj is R & Record<K, R[K]> => Object.hasOwn(obj, key);

    {
      type O =
        | Readonly<{ a: 0 }>
        | Readonly<{ a: 1; b: 1 }>
        | Readonly<{ b: 2 }>
        | Record<string, number>;

      // eslint-disable-next-line no-restricted-syntax
      const obj = { b: 2 } as O;

      if (hasOwnNaive(obj, 'a')) {
        expectType<typeof obj.a, unknown>('=');
      }

      // eslint-disable-next-line no-restricted-syntax
      if ('a' in obj) {
        expectType<typeof obj.a, number>('=');
      }
    }

    {
      type O =
        | Readonly<{ a: 0 }>
        | Readonly<{ a: 1; b: 1 }>
        | Readonly<{ b: 2 }>;

      // eslint-disable-next-line no-restricted-syntax
      const obj = { b: 2 } as O;

      if (hasOwnNaive(obj, 'a')) {
        expectType<typeof obj.a, unknown>('=');
      }

      // eslint-disable-next-line no-restricted-syntax
      if ('a' in obj) {
        expectType<typeof obj.a, 0 | 1>('=');
      }
    }
  }
}
