import { assertType, ReadonlyRecord, TypeEq } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const match = <Keys extends keyof any, V>(
  key: Keys,
  cases: ReadonlyRecord<Keys, V>
): V => cases[key];

type Direction = 'E' | 'N' | 'S' | 'W';
const direction: Direction = 'N';
const res = match(direction as Direction, {
  E: 2,
  N: 3,
  S: 4,
  W: 5,
});

assertType<TypeEq<typeof res, number>>();
