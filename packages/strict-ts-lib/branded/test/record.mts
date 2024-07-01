import { expectType } from './expect-type.mjs';

expectType<
  Exclude<
    Record<number, number> | Record<string, number>,
    Record<string, number>
  >,
  never
>('=');

{
  /**
   * Value が異なる場合は extends は false になる。 value が同じ場合には key の型が string, number,
   * symbol のいずれかであれば extends はなぜか true になる。
   */

  type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

  // key が同じで value が異なる場合
  {
    type A = Record<string, string>;
    type B = Record<string, number>;
    expectType<Eq<A, B>, false>('=');
    expectType<A, B>('!=');
  }
  {
    type A = Record<string, number>;
    type B = Record<string, string>;
    expectType<Eq<A, B>, false>('=');
    expectType<A, B>('!=');
  }

  // value が同じで key が異なる場合
  {
    type A = Record<number, number>;
    type B = Record<string, number>;
    expectType<Eq<A, B>, true>('='); // ?!
    expectType<A, B>('!=');
  }
  {
    type A = Record<symbol, number>;
    type B = Record<string, number>;
    expectType<Eq<A, B>, true>('='); // ?!
    expectType<A, B>('!=');
  }
  {
    type A = Record<symbol, string>;
    type B = Record<string, string>;
    expectType<Eq<A, B>, true>('='); // ?!
    expectType<A, B>('!=');
  }
  {
    type A = Record<number, string>;
    type B = Record<symbol, string>;
    expectType<Eq<A, B>, true>('='); // ?!
    expectType<A, B>('!=');
  }
  {
    type A = Record<symbol, string>;
    type B = Record<string, string>;
    expectType<Eq<A, B>, true>('='); // ?!
    expectType<A, B>('!=');
  }

  // key も value も異なる場合
  {
    type A = Record<symbol, string>;
    type B = Record<string, number>;
    expectType<Eq<A, B>, true>('='); // ?!
    expectType<A, B>('!=');
  }
}

expectType<
  Exclude<
    Record<number, string> | Record<string, string>,
    Record<string, string>
  >,
  never
>('=');

expectType<
  Exclude<
    Record<number, number> | Record<string, string>,
    Record<string, string>
  >,
  Record<number, number>
>('=');

expectType<
  Exclude<
    Record<string, number> | Record<string, string>,
    Record<string, string>
  >,
  Record<string, number>
>('=');
