import { expectType } from './expect-type.mjs';

type RecordType1 = DeepReadonly<{
  x: 1;
  y: 2;
  z: 2;
  3: 4;
}>;

expectType<
  StrictLibInternals.RecordUtilsEntries<RecordType1>,
  readonly (readonly ['3', 4] | readonly ['x', 1] | readonly ['y' | 'z', 2])[]
>('=');

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
  StrictLibInternals.RecordUtilsEntries<RecordType2>,
  | readonly (readonly ['3', 4] | readonly ['x', 1] | readonly ['y' | 'z', 2])[]
  | readonly (
      | readonly ['9', 40]
      | readonly ['a', 10]
      | readonly ['b' | 'c', 20]
    )[]
>('=');

expectType<
  StrictLibInternals.RecordUtilsEntries<Record<string, number>>,
  readonly (readonly [string, number])[]
>('=');

{
  const symb = Symbol();
  const obj = {
    x: 1,
    y: 2,
    z: 2,
    3: 4,
    [symb]: 5,
  } as const;

  const entries0 = Object.entries(obj);

  expectType<
    typeof entries0,
    readonly (readonly ['3', 4] | readonly ['x', 1] | readonly ['y' | 'z', 2])[]
  >('=');
}
