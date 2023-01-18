import { expectType } from '../expect-type';
import { type AppendKey, type NoUnionMemberHasKey } from './has-key2';

describe('hasKey2', () => {
  test('dummy', () => {
    expect(true).toBe(true);
  });

  expectType<NoUnionMemberHasKey<{ a: 0 } | { b: 1 }, 'a'>, false>('=');

  expectType<NoUnionMemberHasKey<{ a?: 0 } | { a?: 0; b: 1 }, 'a'>, false>('=');

  expectType<NoUnionMemberHasKey<{ b: 1 } | { c?: 0 }, 'a'>, true>('=');

  expectType<
    AppendKey<{ a: number }, 'b'>,
    Readonly<{ a: number; b: unknown }>
  >('=');

  expectType<
    AppendKey<{ a: number; b: string }, 'b'>,
    Readonly<{ a: number; b: string }>
  >('=');

  expectType<
    AppendKey<{ a: number; b?: string }, 'b'>,
    Readonly<{ a: number; b?: string }>
  >('=');

  expectType<
    AppendKey<object | { a: number; b: string }, 'b'>,
    Readonly<{ a: number; b: string }>
  >('=');

  expectType<
    AppendKey<{ a: number; b: string } | { c: number }, 'b'>,
    Readonly<{ a: number; b: string }>
  >('=');

  expectType<AppendKey<object, 'b'>, Readonly<{ b: unknown }>>('=');

  // {
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const f = <T>() => {
  //     type A = AppendKey<T, 'b'>
  //     expectType<TypeExtends<AppendKey<T, 'b'>, Readonly<{ b: unknown }>>();
  //   };
  //   // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  //   f;
  // }
});
