import { expectType } from '../expect-type.mjs';
import { hasKey, type HasKeyReturnType } from './has-key.mjs';

test('hasKey type inferences', () => {
  {
    expectType<
      HasKeyReturnType<Readonly<{ a: 0 } | { b: 1 }>, 'a'>,
      Readonly<{ a: 0 }>
    >('=');

    expectType<
      HasKeyReturnType<Readonly<{ a: 0 } | { b: 1 }>, 'b'>,
      Readonly<{ b: 1 }>
    >('=');

    expectType<HasKeyReturnType<Readonly<{ a: 0 } | { b: 1 }>, 'd'>, never>(
      '=',
    );

    expectType<
      HasKeyReturnType<
        Readonly<{ a: 0 } | { a: 1; b: 1 } | { b: 2 } | { c: 3 }>,
        'a'
      >,
      Readonly<{ a: 0 } | { a: 1; b: 1 }>
    >('=');

    expectType<
      HasKeyReturnType<
        Readonly<{ a: 0 } | { a: 1; b: 1 } | { b: 2 } | { c: 3 }>,
        'b'
      >,
      Readonly<{ a: 1; b: 1 } | { b: 2 }>
    >('=');

    expectType<
      HasKeyReturnType<
        | ReadonlyRecord<string, number>
        | Readonly<{ a: 0 } | { a: 1; b: 1 } | { b: 2 }>,
        'a'
      >,
      | Readonly<{ a: 0 } | { a: 1; b: 1 }>
      | (ReadonlyRecord<'a', number> & ReadonlyRecord<string, number>)
    >('=');

    expectType<
      HasKeyReturnType<ReadonlyRecord<string, unknown>, 'a'>,
      ReadonlyRecord<'a', unknown> & ReadonlyRecord<string, unknown>
    >('=');
  }

  {
    type R = Readonly<{ a: 0 } | { b: 1 }>;

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
    type R = Readonly<{ a: 0 } | { a: 1; b: 1 } | { b: 2 } | { c: 3 }>;

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
      | Readonly<{ a: 0 } | { a: 1; b: 1 } | { b: 2 }>;

    const obj: R = { a: 0 } as R;

    expectType<
      R,
      | ReadonlyRecord<string, number>
      | Readonly<{ a: 0 } | { a: 1; b: 1 } | { b: 2 }>
    >('=');

    if (hasKey(obj, 'a')) {
      expectType<typeof obj.a, number>('=');

      expectType<
        typeof obj,
        | Readonly<{ a: 0 } | { a: 1; b: 1 }>
        | (ReadonlyRecord<'a', number> & ReadonlyRecord<string, number>)
      >('=');
    }
  }

  assert.strictEqual(true, true);
});
