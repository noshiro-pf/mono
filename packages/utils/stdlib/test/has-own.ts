import { expectType } from './expect-type';

{
  // _HasOwnReturnType

  expectType<
    _HasOwnReturnType<{ readonly a: 0 } | { readonly b: 1 }, 'a'>,
    { readonly a: 0 }
  >('=');

  expectType<
    _HasOwnReturnType<{ readonly a: 0 } | { readonly b: 1 }, 'b'>,
    { readonly b: 1 }
  >('=');

  expectType<
    _HasOwnReturnType<{ readonly a: 0 } | { readonly b: 1 }, 'd'>,
    never
  >('=');

  expectType<
    _HasOwnReturnType<
      | { readonly a: 0 }
      | { readonly a: 1; readonly b: 1 }
      | { readonly b: 2 }
      | { readonly c: 3 },
      'a'
    >,
    { readonly a: 0 } | { readonly a: 1; readonly b: 1 }
  >('=');

  expectType<
    _HasOwnReturnType<
      | { readonly a: 0 }
      | { readonly a: 1; readonly b: 1 }
      | { readonly b: 2 }
      | { readonly c: 3 },
      'b'
    >,
    { readonly a: 1; readonly b: 1 } | { readonly b: 2 }
  >('=');

  expectType<
    _HasOwnReturnType<
      | { readonly a: 0 }
      | { readonly a: 1; readonly b: 1 }
      | { readonly b: 2 }
      | Record<string, number>,
      'a'
    >,
    | { readonly a: 0 }
    | { readonly a: 1; readonly b: 1 }
    | (Record<'a', number> & Record<string, number>)
  >('=');

  expectType<
    _HasOwnReturnType<Record<string, unknown>, 'a'>,
    Record<'a', unknown> & Record<string, unknown>
  >('=');
}

{
  type R = { readonly a: 0 } | { readonly b: 1 };

  const obj: R = { a: 0 } as R;

  if (Object.hasOwn(obj, 'a')) {
    expectType<typeof obj.a, 0>('=');
    expectType<typeof obj, { readonly a: 0 }>('=');
  }

  if (Object.hasOwn(obj, 'c')) {
    expectType<typeof obj, never>('=');
  }
}

{
  type R =
    | { readonly a: 0 }
    | { readonly a: 1; readonly b: 1 }
    | { readonly b: 2 }
    | { readonly c: 3 };

  const obj: R = { a: 0 } as R;

  if (Object.hasOwn(obj, 'a') && Object.hasOwn(obj, 'b')) {
    expectType<typeof obj.a, 1>('=');
    expectType<typeof obj.b, 1>('=');
    expectType<typeof obj, { readonly a: 1; readonly b: 1 }>('=');
  }
}

{
  type R =
    | { readonly a: 0 }
    | { readonly a: 1; readonly b: 1 }
    | { readonly b: 2 }
    | Record<string, number>;

  const obj: R = ((): R => ({ a: 0 }))();

  expectType<R, Record<string, number>>('!=');

  if (Object.hasOwn(obj, 'a')) {
    expectType<typeof obj.a, 0 | 1 | number>('=');

    expectType<
      typeof obj,
      | { readonly a: 0 }
      | { readonly a: 1; readonly b: 1 }
      | (Record<'a', number> & Record<string, number>)
    >('=');
  }

  if (Object.hasOwn(obj, 'a') && Object.hasOwn(obj, 'b')) {
    expectType<typeof obj.a, 1 | number>('=');
    expectType<typeof obj.b, 1 | number>('=');
    expectType<
      typeof obj,
      | { readonly a: 1; readonly b: 1 }
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
