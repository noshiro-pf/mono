import type { TypeEq } from '../types';
import { assertType } from '../types';
import type { GeneralRecord } from './general-record';
import type { ToObjectKeysValue } from './to-object-keys';

type PickByValue<R, V> = Pick<
  R,
  {
    [K in keyof R]: R[K] extends V ? K : never;
  }[keyof R]
>;

type Entries<R extends GeneralRecord> = {
  [K in keyof R]: [ToObjectKeysValue<keyof PickByValue<R, R[K]>>, R[K]];
  // eslint-disable-next-line @typescript-eslint/ban-types
}[Exclude<keyof R, symbol>][];

export const recordEntries = <R extends GeneralRecord>(object: R): Entries<R> =>
  Object.entries(object) as Entries<R>;

const symb = Symbol();
const entries = recordEntries({ x: 1, y: 2, z: 2, 3: 4, [symb]: 5 } as const);
assertType<TypeEq<typeof entries, (['3', 4] | ['x', 1] | ['y' | 'z', 2])[]>>();
