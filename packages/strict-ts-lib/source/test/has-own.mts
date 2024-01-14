import { expectType } from './expect-type.mjs';

{
  // _HasOwnReturnType

  expectType<
    _HasOwnReturnType<Readonly<{ a: 0 }> | Readonly<{ b: 1 }>, 'a'>,
    Readonly<{ a: 0 }>
  >('=');

  expectType<
    _HasOwnReturnType<Readonly<{ a: 0 }> | Readonly<{ b: 1 }>, 'b'>,
    Readonly<{ b: 1 }>
  >('=');

  expectType<
    _HasOwnReturnType<Readonly<{ a: 0 }> | Readonly<{ b: 1 }>, 'd'>,
    never
  >('=');

  expectType<
    _HasOwnReturnType<
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | Readonly<{ b: 2 }>
      | Readonly<{ c: 3 }>,
      'a'
    >,
    Readonly<{ a: 0 }> | Readonly<{ a: 1; b: 1 }>
  >('=');

  expectType<
    _HasOwnReturnType<
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | Readonly<{ b: 2 }>
      | Readonly<{ c: 3 }>,
      'b'
    >,
    Readonly<{ a: 1; b: 1 }> | Readonly<{ b: 2 }>
  >('=');

  expectType<
    _HasOwnReturnType<
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | Readonly<{ b: 2 }>
      | Record<string, number>,
      'a'
    >,
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | (Record<'a', number> & Record<string, number>)
  >('=');

  expectType<
    _HasOwnReturnType<Record<string, unknown>, 'a'>,
    Record<'a', unknown> & Record<string, unknown>
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
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | Readonly<{ b: 2 }>
    | Record<string, number>;

  // eslint-disable-next-line no-restricted-syntax
  const obj: R = { a: 0 } as R;

  expectType<R, Record<string, number>>('!=');

  if (Object.hasOwn(obj, 'a')) {
    expectType<typeof obj.a, number>('=');

    expectType<
      typeof obj,
      | Readonly<{ a: 0 }>
      | Readonly<{ a: 1; b: 1 }>
      | (Record<'a', number> & Record<string, number>)
    >('=');
  }

  if (Object.hasOwn(obj, 'a') && Object.hasOwn(obj, 'b')) {
    expectType<typeof obj.a, number>('=');
    expectType<typeof obj.b, number>('=');
    expectType<
      typeof obj,
      | Readonly<{ a: 1; b: 1 }>
      | (Record<'a', number> & Record<'b', number> & Record<string, number>)
    >('=');
  }
}

{
  const obj: Record<string, unknown> = { a: 0, b: 1 };

  if (Object.hasOwn(obj, 'a')) {
    expectType<typeof obj.a, unknown>('=');
    expectType<typeof obj, Record<'a', unknown> & Record<string, unknown>>('=');
  }

  if (Object.hasOwn(obj, 'c')) {
    expectType<typeof obj.c, unknown>('=');
    expectType<typeof obj, Record<'c', unknown> & Record<string, unknown>>('=');
  }

  if (Object.hasOwn(obj, 'a') && Object.hasOwn(obj, 'b')) {
    expectType<typeof obj.a, unknown>('=');
    expectType<typeof obj.b, unknown>('=');
    expectType<
      typeof obj,
      Record<'a', unknown> & Record<'b', unknown> & Record<string, unknown>
    >('=');
  }
}
