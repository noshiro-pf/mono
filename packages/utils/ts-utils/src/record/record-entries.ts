import { assertType } from '../types';
import type { ToObjectKeysValue } from './to-object-keys';

type PickByValue<R, V> = Pick<
  R,
  {
    [K in keyof R]: R[K] extends V ? K : never;
  }[keyof R]
>;

type Entries<R extends ReadonlyRecordBase> = R extends R
  ? {
      [K in keyof R]: [ToObjectKeysValue<keyof PickByValue<R, R[K]>>, R[K]];
      // eslint-disable-next-line @typescript-eslint/ban-types
    }[RelaxedExclude<keyof R, symbol>][]
  : never;

export const recordEntries = <R extends ReadonlyRecordBase>(
  object: R
): Entries<R> => Object.entries(object) as Entries<R>;

type RecordType1 = DeepReadonly<{
  x: 1;
  y: 2;
  z: 2;
  3: 4;
}>;

assertType<
  TypeEq<Entries<RecordType1>, (['3', 4] | ['x', 1] | ['y' | 'z', 2])[]>
>();

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

assertType<
  TypeEq<
    Entries<RecordType2>,
    | (['3', 4] | ['x', 1] | ['y' | 'z', 2])[]
    | (['9', 40] | ['a', 10] | ['b' | 'c', 20])[]
  >
>();

assertType<TypeEq<Entries<Record<string, number>>, [string, number][]>>();

const symb = Symbol();
const entries = recordEntries({ x: 1, y: 2, z: 2, 3: 4, [symb]: 5 } as const);
assertType<TypeEq<typeof entries, (['3', 4] | ['x', 1] | ['y' | 'z', 2])[]>>();
