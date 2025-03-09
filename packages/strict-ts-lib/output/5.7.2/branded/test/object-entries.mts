import { expectType } from './expect-type.mjs';

{
  type RecordType1 = DeepReadonly<{
    x: 1;
    y: 2;
    z: 2;
    3: 4;
  }>;

  expectType<
    StrictLibInternals.ToObjectEntries<RecordType1>,
    readonly (
      | readonly ['x', 1]
      | readonly ['y' | 'z', 2]
      | readonly ['3', 4]
      | readonly [string & {}, number]
    )[]
  >('=');
}

// from simple object
{
  const entries = Object.entries({ x: 1, y: 2 });
  expectType<
    typeof entries,
    readonly (
      | readonly ['x', 1]
      | readonly ['y', 2]
      | readonly [string & {}, number]
    )[]
  >('=');
}
{
  type RecordType2 = DeepReadonly<
    | {
        a: 10;
        b: 20;
        c: 20;
        9: 40;
      }
    | {
        x: 1;
        y: 2;
        z: 2;
        3: 4;
      }
  >;

  expectType<
    StrictLibInternals.ToObjectEntries<RecordType2>,
    | readonly (
        | readonly ['3', 4]
        | readonly ['x', 1]
        | readonly ['y' | 'z', 2]
        | readonly [string & {}, number]
      )[]
    | readonly (
        | readonly ['9', 40]
        | readonly ['a', 10]
        | readonly ['b' | 'c', 20]
        | readonly [string & {}, number]
      )[]
  >('=');
}

expectType<
  StrictLibInternals.ToObjectEntries<Record<string, number>>,
  readonly (readonly [string, number])[]
>('~=');

{
  const symb = Symbol();
  const obj = {
    x: 1,
    y: 2,
    z: 2,
    3: 4,
    [symb]: 5,
  } as const;

  // 公式型定義だと [string, number][] になる
  const entries0 = Object.entries(obj);

  expectType<
    typeof entries0,
    readonly (
      | readonly ['3', 4]
      | readonly ['x', 1]
      | readonly ['y' | 'z', 2]
      | readonly [string & {}, number]
    )[]
  >('=');
}
